import { useSelector } from "react-redux";

export const FLAG_CREATE = 'flag_create';
export const FLAG_READ = 'flag_read';
export const FLAG_UPDATE = 'flag_update';
export const FLAG_DELETE = 'flag_delete';

const legacyComponent = {
  flag_delete: 'ticket_delete',
  flag_create: 'add_notes_tickets_attachments'
}

const usePermission = (componentName = 'unnamed_component', flagPermission = FLAG_READ, key = '') => {
  const settings = useSelector(state => state.settingsPreferences)
  const user = useSelector(state => state.user)
  if (!settings || !user) return true; // remove this after CRM-809 material is released

  const flagNewPermission = settings.flag_new_user_permission_enabled
  const flagUseLegacyRights = user.flag_use_legacy_rights;
  const appuserComponentPermissions = user.appuser_component_permission;
  const currentAppuserPermissions = user.currentAppuserPermissions
  const isSystem = user.system;
  const isPrimary = user.primary;
  let allow = true;
  if (isSystem || isPrimary) {
    allow = true;
  } else if (!flagNewPermission || flagUseLegacyRights) {
    let component = key === 'notes' ? legacyComponent[flagPermission] : componentName;
    if (currentAppuserPermissions && typeof currentAppuserPermissions[component] !== 'undefined') {
      allow = currentAppuserPermissions[component];
    }
  } else {
    allow = false;
    const permission = appuserComponentPermissions && appuserComponentPermissions.find(item => item.name === componentName);
    if (permission) {
      allow = permission[flagPermission];
    }
  }

  return allow;
}

export default usePermission;