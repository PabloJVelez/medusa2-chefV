// import React, { PropsWithChildren } from "react"
// import { Heading, Button, Text, Prompt } from "@medusajs/ui"
// import { FieldValues, UseFormReturn } from "react-hook-form"
// import { useForm } from "react-hook-form"
// import { useTranslation } from "react-i18next"
// import { useBlocker } from "react-router-dom"
// import { Form } from "../common/form/form.js"

// // Modal UI components
// const Header = ({ children }) => (
//   <div className="px-6 pt-6 pb-4 border-b border-gray-200">{children}</div>
// )

// const Body = ({ children, className = "" }) => (
//   <div className={`px-6 py-4 ${className}`}>{children}</div>
// )

// const Footer = ({ children, className = "" }) => (
//   <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>{children}</div>
// )

// const Title = ({ children, className = "" }) => (
//   <div className={className}>{children}</div>
// )

// // Form handling component
// type RouteModalFormProps<TFieldValues extends FieldValues> = PropsWithChildren<{
//   form: UseFormReturn<TFieldValues>
//   blockSearchParams?: boolean
//   onClose?: (isSubmitSuccessful: boolean) => void
// }>

// const ModalForm = <TFieldValues extends FieldValues = any>({
//   form,
//   blockSearchParams = false,
//   children,
//   onClose,
// }: RouteModalFormProps<TFieldValues>) => {
//   const { t } = useTranslation()

//   const {
//     formState: { isDirty },
//   } = form

//   const blocker = useBlocker(({ currentLocation, nextLocation }) => {
//     const { isSubmitSuccessful } = nextLocation.state || {}

//     if (isSubmitSuccessful) {
//       onClose?.(true)
//       return false
//     }

//     const isPathChanged = currentLocation.pathname !== nextLocation.pathname
//     const isSearchChanged = currentLocation.search !== nextLocation.search

//     if (blockSearchParams) {
//       const ret = isDirty && (isPathChanged || isSearchChanged)

//       if (!ret) {
//         onClose?.(isSubmitSuccessful)
//       }

//       return ret
//     }

//     const ret = isDirty && isPathChanged

//     if (!ret) {
//       onClose?.(isSubmitSuccessful)
//     }

//     return ret
//   })

//   const handleCancel = () => {
//     blocker?.reset?.()
//   }

//   const handleContinue = () => {
//     blocker?.proceed?.()
//     onClose?.(false)
//   }

//   return (
//     <Form {...form}>
//       {children}
//       <Prompt open={blocker.state === "blocked"} variant="confirmation">
//         <Prompt.Content>
//           <Prompt.Header>
//             <Prompt.Title>{t("general.unsavedChangesTitle")}</Prompt.Title>
//             <Prompt.Description>
//               {t("general.unsavedChangesDescription")}
//             </Prompt.Description>
//           </Prompt.Header>
//           <Prompt.Footer>
//             <Prompt.Cancel onClick={handleCancel} type="button">
//               {t("actions.cancel")}
//             </Prompt.Cancel>
//             <Prompt.Action onClick={handleContinue} type="button">
//               {t("actions.continue")}
//             </Prompt.Action>
//           </Prompt.Footer>
//         </Prompt.Content>
//       </Prompt>
//     </Form>
//   )
// }

// // Main modal component
// type ModalProps = PropsWithChildren<{
//   onClose?: () => void
// }>

// const RouteFocusModal = ({ children, onClose }: ModalProps) => {
//   return (
//     <div className="fixed inset-0 z-50">
//       <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
//       <div className="absolute inset-0 flex items-center justify-center p-4">
//         <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto">
//           {children}
//         </div>
//       </div>
//     </div>
//   )
// }

// // Attach components to the main component
// RouteFocusModal.Header = Header
// RouteFocusModal.Body = Body
// RouteFocusModal.Footer = Footer
// RouteFocusModal.Title = Title
// RouteFocusModal.Form = ModalForm

// export default RouteFocusModal