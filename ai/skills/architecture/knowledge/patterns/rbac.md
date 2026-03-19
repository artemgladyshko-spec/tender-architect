PATTERN: RBAC (Role-Based Access Control)

USE WHEN:
- roles, permissions, access control mentioned
- admin/user roles
- authorization requirements

ARCHITECTURE REQUIREMENTS:

Services:
- AuthService
- AuthorizationService

Data Model:
- User
- Role
- Permission
- RolePermission
- UserRole

API:
- assignRole(userId, roleId)
- checkPermission(userId, action)

Middleware:
- authorization middleware required

UI:
- role management interface
- permission configuration UI

RULES:

- Every protected action MUST be permission-checked
- Roles must be configurable
- No direct access without authorization layer