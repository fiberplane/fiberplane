use fiberplane_models::formatting::{Annotation, AnnotationWithOffset};
use fiberplane_models::notebooks::*;
use fiberplane_models::timestamps::{NewTimeRange, RelativeTimeRange};
use fiberplane_templates::*;

#[test]
fn mustache_substitution_with_formatting() {
    let notebook = NewNotebook::builder()
        .title(r#"Test"#.to_string())
        .cells(vec![Cell::Text(
            TextCell::builder()
                .id("1")
                .content(r#"{{greeting}} {{personName}}, great to have you"#)
                .formatting(vec![
                    // This bold range intentionally overlaps with the mustache variable substitution
                    AnnotationWithOffset::new(13, Annotation::StartBold),
                    AnnotationWithOffset::new(46, Annotation::EndBold),
                ])
                .build(),
        )])
        .time_range(NewTimeRange::Relative(RelativeTimeRange::from_minutes(-60)))
        .build();
    let template = notebook_to_template(notebook);
    assert!(template.contains("fmt.bold([personName, ', great to have you'])"),);
}
