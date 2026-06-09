# Glossary

| Term | Definition | Notes |
| --- | --- | --- |
| Active (User Status) | Account lifecycle state indicating the user is allowed to authenticate and use standard product capabilities (subject to role/authorization). | Default status for newly created users unless explicitly set otherwise. |
| Inactive (User Status) | Account lifecycle state indicating the user is not allowed to authenticate until reactivated by an admin workflow. | Distinct from role/permission; does not imply admin access changes. |
| Admin Access | Dedicated area/workflow for managing privileged `isAdmin` assignments. | User lifecycle flows must treat admin role as read-only and route changes here. |
| User Management | Admin area for lifecycle/profile operations (create, view, edit, status) on users. | Does not own privileged role assignment semantics. |

## Usage Rules
- Prefer glossary terms in specs, tickets, and prompts.
- Add aliases only when legacy naming cannot be removed.
- Mark ambiguous terms and replace over time.
