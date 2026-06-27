export function getAddressId(address) {
  return address?._id || address?.id
}
