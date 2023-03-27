use std::borrow::Cow;

const MIME_TYPE_PREFIX: &str = "application/x-www-form-urlencoded,";

/// Returns the value of a field in the query data.
///
/// Returns an empty string if the field has no value.
pub fn get_query_field<'a>(query_data: &'a str, field_name: &str) -> Cow<'a, str> {
    if let Some(data) = query_data.strip_prefix(MIME_TYPE_PREFIX) {
        for (key, value) in form_urlencoded::parse(data.as_bytes()) {
            if key == field_name {
                return value;
            }
        }
    }

    Cow::Borrowed("")
}

/// Returns whether the query data string contains any query data that we
/// understand.
pub fn has_query_data(query_data: impl AsRef<str>) -> bool {
    if let Some(data) = query_data.as_ref().strip_prefix(MIME_TYPE_PREFIX) {
        !data.is_empty()
    } else {
        false
    }
}

/// Sets the value of a field in the query data.
///
/// Returns the new query data.
///
/// This functions maintains an alphabetical ordering of the keys in order to
/// guarantee a consistent result when separate fields are set out of order.
/// This is to maintain convergence for our OT algorithm.
pub fn set_query_field(
    query_data: impl AsRef<str>,
    field_name: impl AsRef<str>,
    value: impl AsRef<str>,
) -> String {
    let mut new_query_data = MIME_TYPE_PREFIX.to_owned();
    if let Some(data) = query_data.as_ref().strip_prefix(MIME_TYPE_PREFIX) {
        let (before, after): (Vec<_>, Vec<_>) = form_urlencoded::parse(data.as_bytes())
            .filter(|(key, _)| key.as_ref() != field_name.as_ref())
            .partition(|(key, _)| key.as_ref() < field_name.as_ref());
        for (key, value) in before
            .iter()
            .chain(&[(
                Cow::Borrowed(field_name.as_ref()),
                Cow::Borrowed(value.as_ref()),
            )])
            .chain(after.iter())
        {
            append_query_field(&mut new_query_data, key, value);
        }
    } else {
        append_query_field(&mut new_query_data, field_name, value);
    }
    new_query_data
}

/// Removes a field from the query data.
///
/// Returns the new query data.
pub fn unset_query_field(query_data: impl AsRef<str>, field_name: impl AsRef<str>) -> String {
    let mut new_query_data = MIME_TYPE_PREFIX.to_owned();
    if let Some(data) = query_data.as_ref().strip_prefix(MIME_TYPE_PREFIX) {
        for (key, value) in form_urlencoded::parse(data.as_bytes()) {
            if key != field_name.as_ref() {
                append_query_field(&mut new_query_data, &key, &value);
            }
        }
    }
    new_query_data
}

fn append_query_field(
    query_data: &mut String,
    field_name: impl AsRef<str>,
    value: impl AsRef<str>,
) {
    if query_data.len() > MIME_TYPE_PREFIX.len() {
        query_data.push('&');
    }

    query_data.extend(form_urlencoded::byte_serialize(
        field_name.as_ref().as_bytes(),
    ));
    query_data.push('=');
    query_data.extend(form_urlencoded::byte_serialize(value.as_ref().as_bytes()));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_query_field() {
        assert_eq!(
            get_query_field("application/x-www-form-urlencoded,trace_id=123", "trace_id"),
            "123"
        );
        assert_eq!(
            get_query_field("application/x-www-form-urlencoded,trace_id=123", "id"),
            ""
        );
        assert_eq!(get_query_field("trace_id=123", "trace_id"), "");
        assert_eq!(get_query_field("", "trace_id"), "");

        assert_eq!(
            get_query_field("application/x-www-form-urlencoded,hi+=%26there", "hi "),
            "&there"
        );
    }

    #[test]
    fn test_set_query_field() {
        assert_eq!(
            &set_query_field(
                "application/x-www-form-urlencoded,trace_id=123",
                "trace_id",
                "456"
            ),
            "application/x-www-form-urlencoded,trace_id=456"
        );
        assert_eq!(
            &set_query_field(
                "application/x-www-form-urlencoded,trace_id=123",
                "id",
                "456"
            ),
            "application/x-www-form-urlencoded,id=456&trace_id=123"
        );
        assert_eq!(
            &set_query_field("trace_id=123", "trace_id", "456"),
            "application/x-www-form-urlencoded,trace_id=456"
        );
        assert_eq!(
            &set_query_field("", "trace_id", "456"),
            "application/x-www-form-urlencoded,trace_id=456"
        );

        assert_eq!(
            &set_query_field(
                "application/x-www-form-urlencoded,hi+=%26there",
                "hi!",
                "-_.!~*'()#"
            ),
            "application/x-www-form-urlencoded,hi+=%26there&hi%21=-_.%21%7E*%27%28%29%23"
        );
    }

    #[test]
    fn test_unset_query_field() {
        assert_eq!(
            &unset_query_field("application/x-www-form-urlencoded,trace_id=123", "trace_id"),
            "application/x-www-form-urlencoded,"
        );
        assert_eq!(
            &unset_query_field("application/x-www-form-urlencoded,trace_id=123", "id"),
            "application/x-www-form-urlencoded,trace_id=123"
        );
        assert_eq!(
            &unset_query_field("trace_id=123", "trace_id"),
            "application/x-www-form-urlencoded,"
        );
        assert_eq!(
            &unset_query_field("", "trace_id"),
            "application/x-www-form-urlencoded,"
        );

        assert_eq!(
            &unset_query_field("application/x-www-form-urlencoded,hi+=%26there", "hi "),
            "application/x-www-form-urlencoded,"
        );
    }
}
