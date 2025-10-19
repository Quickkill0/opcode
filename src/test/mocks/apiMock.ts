import { vi } from 'vitest';
import type { Project, Session, Agent, MCPServer } from '@/lib/api';

// Mock data
export const mockProjects: Project[] = [
  {
    id: 'test-project-1',
    path: 'C:\\Users\\test\\project1',
    sessions: ['session-1', 'session-2', 'session-3'],
    created_at: new Date('2024-01-01').getTime() / 1000,
    most_recent_session: new Date('2024-01-15').getTime() / 1000,
  },
  {
    id: 'test-project-2',
    path: 'C:\\Users\\test\\project2',
    sessions: ['session-4', 'session-5'],
    created_at: new Date('2024-01-02').getTime() / 1000,
    most_recent_session: new Date('2024-01-20').getTime() / 1000,
  },
];

export const mockSessions: Session[] = [
  {
    id: 'session-1',
    project_id: 'test-project-1',
    project_path: 'C:\\Users\\test\\project1',
    created_at: new Date('2024-01-01').getTime() / 1000,
    first_message: 'Hello, this is the first message',
    message_timestamp: new Date('2024-01-01').toISOString(),
  },
];

export const mockAgents: Agent[] = [
  {
    id: 1,
    name: 'Test Agent',
    icon: '🤖',
    system_prompt: 'You are a test agent',
    default_task: 'Help with testing',
    model: 'claude-sonnet-4-5',
    hooks: undefined,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date('2024-01-01').toISOString(),
  },
];

export const mockMCPServers: MCPServer[] = [
  {
    name: 'test-server',
    transport: 'stdio',
    command: 'node',
    args: ['test.js'],
    env: {},
    scope: 'local',
    is_active: true,
    status: {
      running: true,
      last_checked: Date.now(),
    },
  },
];

// Create mock API
export const createMockApi = () => ({
  // Projects
  listProjects: vi.fn().mockResolvedValue(mockProjects),
  createProject: vi.fn().mockResolvedValue(mockProjects[0]),
  getProjectSessions: vi.fn().mockResolvedValue(mockSessions),

  // Sessions
  openNewSession: vi.fn().mockResolvedValue('new-session-id'),
  loadSessionHistory: vi.fn().mockResolvedValue([]),

  // Agents
  listAgents: vi.fn().mockResolvedValue(mockAgents),
  createAgent: vi.fn().mockResolvedValue(mockAgents[0]),
  updateAgent: vi.fn().mockResolvedValue(mockAgents[0]),
  deleteAgent: vi.fn().mockResolvedValue(undefined),
  executeAgent: vi.fn().mockResolvedValue(1),

  // MCP
  mcpList: vi.fn().mockResolvedValue(mockMCPServers),
  mcpAdd: vi.fn().mockResolvedValue({ success: true, message: 'Server added' }),
  mcpRemove: vi.fn().mockResolvedValue('Server removed'),
  mcpTestConnection: vi.fn().mockResolvedValue('Connection successful'),

  // Settings
  getSetting: vi.fn().mockResolvedValue(null),
  saveSetting: vi.fn().mockResolvedValue(undefined),

  // Utilities
  getHomeDirectory: vi.fn().mockResolvedValue('C:\\Users\\test'),
  listDirectoryContents: vi.fn().mockResolvedValue([]),
  checkClaudeVersion: vi.fn().mockResolvedValue({ is_installed: true, version: '1.0.0', output: 'claude 1.0.0' }),
  listClaudeInstallations: vi.fn().mockResolvedValue([{ path: 'C:\\claude.exe', version: '1.0.0', source: 'system', installation_type: 'System' }]),
});

export const mockApi = createMockApi();
