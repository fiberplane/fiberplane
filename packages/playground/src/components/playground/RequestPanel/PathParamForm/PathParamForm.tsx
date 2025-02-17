// import { KeyValueFormRow } from "../../KeyValueForm";
// import { createChangeEnabled } from "../../KeyValueForm/data";
// import type { ChangeKeyValueElementsHandler } from "../../KeyValueForm/types";
// import type { KeyValueElement } from "../../store";
// import { createChangePathParamValue } from "./data";

// type Props = {
//   keyValueElements: KeyValueElement[];
//   onChange: ChangeKeyValueElementsHandler;
//   onSubmit?: () => void;
//   keyPlaceholder?: string;
//   handleCmdG?: () => void;
//   handleCmdB?: () => void;
// };

// /**
//  * This is like a KeyValueForm, but all of the parameter keys are fixed (cannot be changed),
//  * and none of the entries can be fully removed.
//  *
//  * Remember: Path params are *computed* from the route pattern.
//  */
// export const PathParamForm = (props: Props) => {
//   const {
//     onChange,
//     keyValueElements,
//     onSubmit,
//     keyPlaceholder,
//     handleCmdG,
//     handleCmdB,
//   } = props;

//   return (
//     <div className="space-y-2">
//       {keyValueElements.map((parameter) => {
//         const isDraft = !parameter.data.value;
//         return (
//           <KeyValueFormRow
//             key={parameter.id}
//             keyValueData={parameter}
//             isDraft={isDraft}
//             onChangeEnabled={createChangeEnabled(
//               onChange,
//               keyValueElements,
//               parameter,
//             )}
//             onChangeValue={createChangePathParamValue(
//               onChange,
//               keyValueElements,
//               parameter,
//             )}
//             onSubmit={onSubmit}
//             keyPlaceholder={keyPlaceholder}
//             handleCmdG={handleCmdG}
//             handleCmdB={handleCmdB}
//           />
//         );
//       })}
//     </div>
//   );
// };
