/*
 * Fiberplane API
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 *
 * Generated by: https://openapi-generator.tech
 */

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Annotation {
    #[serde(rename = "end_bold")]
    EndBoldAnnotation {
        #[serde(rename = "offset")]
        offset: i32,
    },
    #[serde(rename = "end_code")]
    EndCodeAnnotation {
        #[serde(rename = "offset")]
        offset: i32,
    },
    #[serde(rename = "end_highlight")]
    EndHighlightAnnotation {
        #[serde(rename = "offset")]
        offset: i32,
    },
    #[serde(rename = "end_italics")]
    EndItalicsAnnotation {
        #[serde(rename = "offset")]
        offset: i32,
    },
    #[serde(rename = "end_link")]
    EndLinkAnnotation {
        #[serde(rename = "offset")]
        offset: i32,
    },
    #[serde(rename = "end_strikethrough")]
    EndStrikethroughAnnotation {
        #[serde(rename = "offset")]
        offset: i32,
    },
    #[serde(rename = "end_underline")]
    EndUnderlineAnnotation {
        #[serde(rename = "offset")]
        offset: i32,
    },
    #[serde(rename = "mention")]
    MentionAnnotation {
        #[serde(rename = "offset")]
        offset: i32,
        #[serde(rename = "name")]
        name: String,
        #[serde(rename = "userId")]
        user_id: String,
    },
    #[serde(rename = "start_bold")]
    StartBoldAnnotation {
        #[serde(rename = "offset")]
        offset: i32,
    },
    #[serde(rename = "start_code")]
    StartCodeAnnotation {
        #[serde(rename = "offset")]
        offset: i32,
    },
    #[serde(rename = "start_highlight")]
    StartHighlightAnnotation {
        #[serde(rename = "offset")]
        offset: i32,
    },
    #[serde(rename = "start_italics")]
    StartItalicsAnnotation {
        #[serde(rename = "offset")]
        offset: i32,
    },
    #[serde(rename = "start_link")]
    StartLinkAnnotation {
        #[serde(rename = "offset")]
        offset: i32,
        #[serde(rename = "url")]
        url: String,
    },
    #[serde(rename = "start_strikethrough")]
    StartStrikethroughAnnotation {
        #[serde(rename = "offset")]
        offset: i32,
    },
    #[serde(rename = "start_underline")]
    StartUnderlineAnnotation {
        #[serde(rename = "offset")]
        offset: i32,
    },
    #[serde(rename = "timestamp")]
    TimestampAnnotation {
        #[serde(rename = "offset")]
        offset: i32,
        #[serde(rename = "timestamp")]
        timestamp: f64,
    },
}