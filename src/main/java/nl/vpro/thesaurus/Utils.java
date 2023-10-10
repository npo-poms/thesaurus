package nl.vpro.thesaurus;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;
import java.time.Instant;
import java.util.*;

import javax.crypto.SecretKey;

import org.checkerframework.checker.nullness.qual.NonNull;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import nl.vpro.configuration.spring.PropertiesUtil;
import nl.vpro.domain.gtaa.Scheme;
import nl.vpro.i18n.Displayable;

/**
 *
 * Utilities to write information from java to objects usable in javascript.
 *
 * @author Michiel Meeuwissen
 * @since 5.10
 */
@Slf4j
public class Utils implements ApplicationContextAware {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static ApplicationContext applicationContext;

    @Override
    public void setApplicationContext(@NonNull  ApplicationContext applicationContext) throws BeansException {
        Utils.applicationContext = applicationContext;
    }

    /**
     * Given the subject, calculates a JWT-string for the currently logged-in user.
     * @param subject Subject
     * @param expiration and expiration date neede for the jws
     * @return The JWT-string, or an empty string if there is no currently logged-in user.
     */
    public static String jws(@NonNull String subject, @NonNull Instant expiration) {

        PropertiesUtil properties = applicationContext.getBeanProvider(PropertiesUtil.class).getIfAvailable();
        if (properties == null) {
            throw new RuntimeException("No properties found on application context");
        }
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Principal) {
            String authentication = ((Principal) principal).getName();
            String issuer = properties.getMap().get("gtaa.example.issuer");
            log.debug("Issuer {}", issuer);
            return jws(subject, authentication, issuer, expiration);
        } else {
            String authentication = principal.toString();
            log.debug("No valid authentication found {}", authentication);
            return "";
        }
    }

    /**
     * Represents an enum as a json array of objects, where each map entry at least contains a 'name' (the name of the enum) key and a 'label' (defaults to its {@link Object#toString()} value) but it
     * can contain more values depending on which enum it actually is (it e.g. may implement {@link Displayable}, and may also have
     * a 'pluralLabel')).
     * @param enumClass The class of the enum to represent all possible values of.
     */

    public static String buildJsonArray(@NonNull Class<? extends Enum<?>>  enumClass) throws JsonProcessingException {
        List<Map<String, String>> result = new ArrayList<>();
        for (Enum<?> type : enumClass.getEnumConstants()) {
            if (type instanceof Displayable displayable) {
                if (! displayable.display()) {
                    continue;
                }
            }
            result.add(
                toMap(type)
            );
        }
        return MAPPER.writeValueAsString(result);
    }

     /**
      * Represents an enum as a json object of objects, the keys are the enum's '{@link Enum#name()}} and the values are the same values as in {@link #buildJsonArray(Class)}
     * @param enumClass The class of the enum to represent all possible values of.
     */

    public static String buildJsonObject(@NonNull Class<? extends Enum<?>>  enumClass) throws JsonProcessingException {
        final Map<String, Map<String, String>> result = new HashMap<>();
        for (Enum<?> type : enumClass.getEnumConstants()) {
            if (type instanceof Displayable displayable) {
                if (! displayable.display()) {
                    continue;
                }
            }
            result.put(type.name(), toMap(type));
        }
        return MAPPER.writeValueAsString(result);
    }


    static String jws(
        @NonNull String subject,
        @NonNull String jwsUser,
        @NonNull String jwsIssuer,
        @NonNull Instant  expires) {

        PropertiesUtil properties = applicationContext.getBeanProvider(PropertiesUtil.class).getIfAvailable();
        if (properties == null) {
            throw new RuntimeException("No properties found on application context");
        }
        String key = properties.getMap().get("gtaa.example.key");


        SecretKey secretKey = Keys.hmacShaKeyFor(key.getBytes());

        return Jwts.builder()
            .subject(subject)
            .claim("usr", jwsUser)
            .issuedAt(Date.from(Instant.now()))
            .issuer(jwsIssuer)
            .expiration(Date.from(expires))
            .signWith(secretKey, Jwts.SIG.HS256)
            .compact();
    }

    static Map<String, String> toMap(@NonNull Enum<?> type) {
        final Map<String, String> item = new HashMap<>();
        item.put("name", type.name());
        if (type instanceof Displayable displayable) {
            displayable.getPluralDisplayName().ifPresent((pluralLabel) ->
                item.put("pluralLabel", pluralLabel.toString())
            );
            item.put("label", displayable.getDisplayName());
        } else {
            item.put("label", type.toString());
        }

        if (type instanceof Scheme scheme) {
            item.put("url", scheme.getUrl());
            item.put("objectType", scheme.name());
        }
        return item;

    }

}
