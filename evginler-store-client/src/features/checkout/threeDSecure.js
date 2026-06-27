const htmlFields = ['threeDSHtmlContent', 'htmlContent', 'paymentPageContent', 'checkoutFormContent']
const redirectFields = ['redirectUrl', 'paymentPageUrl', 'url']

export function startThreeDSecure(paymentResponse) {
  const htmlContent = htmlFields.map((field) => paymentResponse?.[field]).find(Boolean)
  const redirectUrl = redirectFields.map((field) => paymentResponse?.[field]).find(Boolean)

  if (redirectUrl) {
    window.location.href = redirectUrl
    return true
  }

  if (htmlContent) {
    document.open()
    document.write(htmlContent)
    document.close()
    return true
  }

  return false
}
