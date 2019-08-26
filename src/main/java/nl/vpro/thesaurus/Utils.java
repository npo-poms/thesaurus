package nl.vpro.thesaurus;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

import java.time.Instant;
import java.util.*;

import javax.crypto.SecretKey;

import org.checkerframework.checker.nullness.qual.NonNull;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.ldap.userdetails.InetOrgPerson;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import nl.vpro.domain.Displayable;
import nl.vpro.domain.gtaa.Scheme;
import nl.vpro.util.PropertiesUtil;

/**
 *
 * Utilities to write information from java to objects useable in javascript.
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

    public static String jws(@NonNull String subject, @NonNull Instant expiration) {

        PropertiesUtil properties = applicationContext.getBeanProvider(PropertiesUtil.class).getIfAvailable();
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof InetOrgPerson) {
            String authentication = ((InetOrgPerson) principal).getUsername();
            return jws(subject, authentication, properties.getMap().get("gtaa.example.issuer"), expiration);
        } else {
            String authentication = principal.toString();
            log.debug("No valid authentication found");
            return "";
        }
    }


    public static String buildJsonArray(@NonNull Class<? extends Enum<?>>  enumClass) throws JsonProcessingException {
        List<Map<String, String>> result = new ArrayList<>();
        for (Enum type : enumClass.getEnumConstants()) {
            result.add(toMap(type));
        }
        return MAPPER.writeValueAsString(result);
    }
    public static String buildJsonObject(@NonNull Class<? extends Enum<?>>  enumClass) throws JsonProcessingException {
        Map<String, Map<String, String>> result = new HashMap<>();
        for (Enum type : enumClass.getEnumConstants()) {
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
        String key = properties.getMap().get("gtaa.example.key");


        SecretKey secretKey = Keys.hmacShaKeyFor(key.getBytes());

        return Jwts.builder()
            .setSubject(subject)
            .claim("usr", jwsUser)
            .setIssuedAt(Date.from(Instant.now()))
            .setIssuer(jwsIssuer)
            .setExpiration(Date.from(expires))
            .signWith(secretKey, SignatureAlgorithm.HS256)
            .compact();
    }

    static Map<String, String> toMap(@NonNull Enum type) {
        Map<String, String> item = new HashMap<>();
        item.put("name", type.name());
        if (type instanceof Displayable) {
            Displayable displayable = (Displayable) type;
            displayable.getPluralDisplayName().ifPresent((pluralLabel) -> {
                item.put("plurallabel", pluralLabel.toString());
            });
            item.put("label", displayable.getDisplayName());
        } else {

            item.put("label", type.toString());
        }

        if (type instanceof Scheme) {
            item.put("url", ((Scheme) type).getUrl());
            item.put("objectType", type.name());
        }
        return item;

    }

}
