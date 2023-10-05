package nl.vpro.thesaurus;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.core.JsonProcessingException;

import nl.vpro.domain.media.AVType;
import nl.vpro.test.util.jackson2.Jackson2TestUtil;


/**
 * @author Michiel Meeuwissen
 * @since 5.11
 */
public class UtilsTest {



    @Test
    public void buildJsonArray() throws JsonProcessingException {
        Jackson2TestUtil.assertThatJson(
            Utils.buildJsonArray(AVType.class))
            .isSimilarTo(
                """
                    [
                    {"name":"AUDIO","label":"Audio"},
                    {"name":"VIDEO","label":"Video"},
                    {"name":"MIXED","label":"Afwisselend"}
                    ]
                    """);
    }
}
