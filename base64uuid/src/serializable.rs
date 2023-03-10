use crate::Base64Uuid;
use fp_bindgen::prelude::*;
use fp_bindgen::types::CargoDependency;
use std::collections::BTreeMap;

impl Serializable for Base64Uuid {
    fn ident() -> TypeIdent {
        TypeIdent::from("Base64Uuid")
    }

    fn ty() -> Type {
        Type::Custom(CustomType {
            ident: Self::ident(),
            rs_ty: "base64uuid::Base64Uuid".to_owned(),
            rs_dependencies: BTreeMap::from([(
                "base64uuid",
                CargoDependency::with_version(env!("CARGO_PKG_VERSION")),
            )]),
            serde_attrs: Default::default(),
            ts_ty: "string".to_owned(),
            ts_declaration: None,
        })
    }
}
