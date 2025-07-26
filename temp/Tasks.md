# ParallelLean Multi-Workspace Implementation Plan

- [ ] 1. Set up database schema and migrations
- [ ] 1.1 Create workspaces table migration
  - Add id, name, owner_id, invite_code, created_at, updated_at columns
  - Implement UNIQUE constraint on owner_id
  - Set invite_code as UUID with default generation
  - _Requirements: US-1.1, US-2.1_

- [ ] 1.2 Create workspace_members table migration
  - Add id, workspace_id, user_id, role, permission, area_permissions, joined_at, last_accessed_at columns
  - Implement UNIQUE constraint on (workspace_id, user_id)
  - Add CHECK constraint for owner permissions
  - _Requirements: US-2.2, US-2.4_

- [ ] 1.3 Update existing tables with workspace_id
  - Add workspace_id column to nodes table with foreign key
  - Add workspace_id column to edges table with foreign key
  - Add workspace_id column to documents table with foreign key
  - Create indexes on workspace_id for performance
  - _Requirements: US-4.1, US-4.3_

- [ ] 1.4 Create RLS policies for data isolation
  - Write policy for workspaces table (owner access)
  - Write policy for workspace_members table (member access)
  - Write policies for nodes, edges, documents tables (workspace scoped)
  - Test RLS policies with different user contexts
  - _Requirements: US-4.1, US-4.2, US-4.3_

- [ ] 2. Implement core workspace types and interfaces
- [ ] 2.1 Create TypeScript type definitions
  - Define Workspace, WorkspaceMember, MemberRole, MemberPermission enums
  - Create IWorkspaceProvider, IPermissions, IWorkspaceManager interfaces
  - Add workspace_id to existing Node and Edge types
  - _Requirements: US-1.1, US-2.4_

- [ ] 2.2 Create workspace context provider
  - Implement WorkspaceProvider component with React Context
  - Add currentWorkspace state and setter methods
  - Implement permission calculation logic
  - Write unit tests for permission calculations
  - _Requirements: US-3.2, US-4.2_

- [ ] 3. Build workspace management API layer
- [ ] 3.1 Implement workspace CRUD operations
  - Create createWorkspace function with owner constraint validation
  - Implement getWorkspace and listWorkspaces functions
  - Create updateWorkspace function with permission checks
  - Write deleteWorkspace function with cascade deletion
  - _Requirements: US-1.1, US-1.2, US-1.3, US-3.1_

- [ ] 3.2 Implement member management functions
  - Create joinWorkspace function with invite code validation
  - Implement removeMember function with permission checks
  - Create updateMemberPermissions function
  - Write listMembers function with role filtering
  - _Requirements: US-2.2, US-2.3, US-2.4_

- [ ] 3.3 Create workspace-scoped data access layer
  - Update node CRUD functions to include workspace_id
  - Update edge CRUD functions to include workspace_id
  - Modify document operations to be workspace-scoped
  - Write integration tests for data isolation
  - _Requirements: US-4.1, US-4.3_

- [ ] 4. Develop home page and workspace selection UI
- [ ] 4.1 Create WorkspaceList component
  - Implement workspace card display with name, role, last accessed
  - Add relative time formatting (e.g., "3時間前")
  - Include visual role indicators (オーナー/メンバー)
  - Write component tests
  - _Requirements: US-3.0, US-3.1_

- [ ] 4.2 Build CreateWorkspaceModal component
  - Create form with workspace name input (1-50 chars validation)
  - Implement owner constraint check and disabled state
  - Add error handling and toast notifications
  - Write form validation tests
  - _Requirements: US-1.1, US-3.0_

- [ ] 4.3 Build JoinWorkspaceModal component
  - Create invite code input with UUID normalization
  - Implement case-insensitive and hyphen-flexible validation
  - Add workspace preview before joining
  - Write input validation tests
  - _Requirements: US-2.2, US-3.3_

- [ ] 5. Implement workspace context integration
- [ ] 5.1 Update app router structure
  - Create workspace route with workspace_id parameter
  - Implement workspace context initialization
  - Add workspace switching logic
  - Write routing tests
  - _Requirements: US-3.2_

- [ ] 5.2 Integrate WorkspaceProvider with existing stores
  - Update Zustand store to be workspace-aware
  - Modify Valtio store for workspace scoping
  - Ensure graph data is filtered by workspace
  - Write integration tests
  - _Requirements: US-3.2, US-4.1_

- [ ] 6. Build workspace header and settings components
- [ ] 6.1 Create WorkspaceHeader component
  - Implement workspace name display
  - Add WorkspaceSelector dropdown
  - Create InviteCodeDisplay with copy functionality
  - Write component tests
  - _Requirements: US-2.1, US-3.2_

- [ ] 6.2 Develop WorkspaceSettings page
  - Create settings navigation tabs
  - Implement workspace name edit form (owner only)
  - Add delete workspace confirmation dialog
  - Write permission-based UI tests
  - _Requirements: US-1.2, US-1.3_

- [ ] 6.3 Build MemberList component
  - Create member table with search functionality
  - Add role and permission display columns
  - Implement remove member action (owner only)
  - Write component tests with mock data
  - _Requirements: US-2.3, US-2.4_

- [ ] 6.4 Create PermissionEditor component
  - Build permission type selector (read-only, full, area-specific)
  - Create area-specific permission toggles
  - Implement permission update API calls
  - Write permission change tests
  - _Requirements: US-2.4_

- [ ] 7. Implement error handling and session management
- [ ] 7.1 Create WorkspaceErrorHandler class
  - Define error codes and messages
  - Implement error response formatting
  - Add automatic redirect logic for 401/403
  - Write error handler tests
  - _Requirements: US-4.1, US-4.4_

- [ ] 7.2 Build WorkspaceErrorBoundary component
  - Implement React error boundary
  - Add toast notifications for errors
  - Handle workspace deletion scenarios
  - Write error boundary tests
  - _Requirements: US-4.4_

- [ ] 7.3 Update authentication flow
  - Modify auth middleware for workspace context
  - Implement 401 handling with auto-redirect
  - Add workspace membership verification
  - Write auth flow tests
  - _Requirements: US-4.1, US-4.4_

- [ ] 8. Update real-time synchronization
- [ ] 8.1 Modify Supabase realtime subscriptions
  - Scope realtime channels to workspace_id
  - Update subscription filters for data isolation
  - Handle workspace switching in subscriptions
  - Write realtime sync tests
  - _Requirements: US-4.1_

- [ ] 8.2 Implement optimistic updates
  - Add optimistic locking for concurrent edits
  - Implement Last Write Wins strategy
  - Handle conflict resolution in UI
  - Write concurrency tests
  - _Requirements: 同時編集仕様_

- [ ] 9. Create data migration utilities
- [ ] 9.1 Build migration script for existing data
  - Create default workspace for existing users
  - Migrate all nodes, edges, documents to default workspace
  - Update user roles to owner for default workspace
  - Write migration tests with sample data
  - _Requirements: US-1.1_

- [ ] 9.2 Implement rollback functionality
  - Create rollback script for emergency scenarios
  - Add data validation before and after migration
  - Implement migration status tracking
  - Write rollback tests
  - _Requirements: データ移行仕様_

- [ ] 10. Comprehensive testing and validation
- [ ] 10.1 Write E2E tests for complete workflows
  - Test workspace creation flow
  - Test member invitation and joining flow
  - Test permission-based access control
  - Test workspace deletion cascade
  - _Requirements: US-1.1, US-2.2, US-4.2, US-1.3_

- [ ] 10.2 Perform security testing
  - Test RLS policy enforcement
  - Verify cross-workspace data isolation
  - Test permission bypass attempts
  - Validate input sanitization
  - _Requirements: US-4.1, US-4.2, US-4.3_

- [ ] 10.3 Write performance tests
  - Test workspace switching under 3 seconds
  - Verify query performance with indexes
  - Test concurrent user operations
  - Measure API response times
  - _Requirements: パフォーマンス要件_