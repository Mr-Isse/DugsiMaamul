/** Read school subdomain from logged-in user for API tenant headers */
export function getActiveTenantSubdomain(userInfo) {
  const school = userInfo?.school;
  if (!school) return null;
  return school.subdomain || school.tenantId || null;
}

export function schoolToTenantInfo(school) {
  if (!school) return null;
  return {
    type: 'school',
    _id: school._id,
    name: school.name,
    logo: school.logo,
    subdomain: school.subdomain,
    tenantId: school.subdomain,
  };
}
