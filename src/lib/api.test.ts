import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock apiAdapter instead of direct Tauri invoke
vi.mock('./apiAdapter', () => ({
  apiCall: vi.fn(),
}));

import { apiCall } from './apiAdapter';
import { api } from './api';

describe('API Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Project Operations', () => {
    it('lists projects', async () => {
      const mockProjects = [
        {
          id: 'p1',
          path: 'C:\\test\\p1',
          sessions: ['s1', 's2'],
          created_at: 1234567890,
          most_recent_session: 1234567900
        },
      ];
      vi.mocked(apiCall).mockResolvedValueOnce(mockProjects);

      const result = await api.listProjects();

      expect(apiCall).toHaveBeenCalledWith('list_projects');
      expect(result).toEqual(mockProjects);
    });

    it('creates a project', async () => {
      const mockProject = {
        id: 'new',
        path: 'C:\\test\\new',
        sessions: [],
        created_at: 1234567890
      };
      vi.mocked(apiCall).mockResolvedValueOnce(mockProject);

      const result = await api.createProject('C:\\test\\new');

      expect(apiCall).toHaveBeenCalledWith('create_project', { path: 'C:\\test\\new' });
      expect(result).toEqual(mockProject);
    });

    it('handles Windows paths in createProject', async () => {
      const windowsPath = 'C:\\Users\\Test\\Documents\\MyProject';
      const mockProject = {
        id: 'test',
        path: windowsPath,
        sessions: [],
        created_at: 1234567890
      };
      vi.mocked(apiCall).mockResolvedValueOnce(mockProject);

      await api.createProject(windowsPath);

      expect(apiCall).toHaveBeenCalledWith('create_project', { path: windowsPath });
    });
  });

  describe('Session Operations', () => {
    it('gets project sessions', async () => {
      const mockSessions = [
        {
          id: 's1',
          project_id: 'p1',
          project_path: 'C:\\test\\p1',
          created_at: 1234567890,
          first_message: 'Hello',
          message_timestamp: '2024-01-01T00:00:00Z'
        },
      ];
      vi.mocked(apiCall).mockResolvedValueOnce(mockSessions);

      const result = await api.getProjectSessions('project-1');

      expect(apiCall).toHaveBeenCalledWith('get_project_sessions', { projectId: 'project-1' });
      expect(result).toEqual(mockSessions);
    });

    it('opens a new session', async () => {
      vi.mocked(apiCall).mockResolvedValueOnce('new-session-id');

      const result = await api.openNewSession('C:\\test\\project');

      expect(apiCall).toHaveBeenCalledWith('open_new_session', { path: 'C:\\test\\project' });
      expect(result).toBe('new-session-id');
    });

    it('loads session history', async () => {
      const mockHistory = [
        { type: 'user', content: 'Hello' },
        { type: 'assistant', content: 'Hi there!' }
      ];
      vi.mocked(apiCall).mockResolvedValueOnce(mockHistory);

      const result = await api.loadSessionHistory('session-1', 'project-1');

      expect(apiCall).toHaveBeenCalledWith('load_session_history', {
        sessionId: 'session-1',
        projectId: 'project-1'
      });
      expect(result).toEqual(mockHistory);
    });
  });

  describe('Agent Operations', () => {
    it('lists agents', async () => {
      const mockAgents = [
        {
          id: 1,
          name: 'Test Agent',
          icon: '🤖',
          system_prompt: 'Test prompt',
          default_task: 'Help with testing',
          model: 'claude-sonnet-4-5',
          hooks: undefined,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];
      vi.mocked(apiCall).mockResolvedValueOnce(mockAgents);

      const result = await api.listAgents();

      expect(apiCall).toHaveBeenCalledWith('list_agents');
      expect(result).toEqual(mockAgents);
    });

    it('creates an agent', async () => {
      const mockAgent = {
        id: 1,
        name: 'New Agent',
        icon: '🤖',
        system_prompt: 'System prompt',
        default_task: 'Default task',
        model: 'claude-sonnet-4-5',
        hooks: undefined,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      vi.mocked(apiCall).mockResolvedValueOnce(mockAgent);

      const result = await api.createAgent(
        'New Agent',
        '🤖',
        'System prompt',
        'Default task',
        'claude-sonnet-4-5'
      );

      expect(apiCall).toHaveBeenCalledWith('create_agent', {
        name: 'New Agent',
        icon: '🤖',
        systemPrompt: 'System prompt',
        defaultTask: 'Default task',
        model: 'claude-sonnet-4-5',
        hooks: undefined
      });
      expect(result).toEqual(mockAgent);
    });

    it('updates an agent', async () => {
      const mockAgent = {
        id: 1,
        name: 'Updated Agent',
        icon: '🔧',
        system_prompt: 'Updated prompt',
        default_task: 'Updated task',
        model: 'claude-opus-4',
        hooks: undefined,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      vi.mocked(apiCall).mockResolvedValueOnce(mockAgent);

      const result = await api.updateAgent(
        1,
        'Updated Agent',
        '🔧',
        'Updated prompt',
        'Updated task',
        'claude-opus-4'
      );

      expect(apiCall).toHaveBeenCalledWith('update_agent', {
        id: 1,
        name: 'Updated Agent',
        icon: '🔧',
        systemPrompt: 'Updated prompt',
        defaultTask: 'Updated task',
        model: 'claude-opus-4',
        hooks: undefined
      });
      expect(result).toEqual(mockAgent);
    });

    it('deletes an agent', async () => {
      vi.mocked(apiCall).mockResolvedValueOnce(undefined);

      await api.deleteAgent(1);

      expect(apiCall).toHaveBeenCalledWith('delete_agent', { id: 1 });
    });
  });

  describe('MCP Server Operations', () => {
    it('lists MCP servers', async () => {
      const mockServers = [
        {
          name: 'test-server',
          transport: 'stdio',
          command: 'node',
          args: ['test.js'],
          env: {},
          scope: 'local',
          is_active: true,
          status: { running: true, last_checked: 1234567890 }
        },
      ];
      vi.mocked(apiCall).mockResolvedValueOnce(mockServers);

      const result = await api.mcpList();

      expect(apiCall).toHaveBeenCalledWith('mcp_list');
      expect(result).toEqual(mockServers);
    });

    it('adds MCP server', async () => {
      const addResult = { success: true, message: 'Server added', server_name: 'new-server' };
      vi.mocked(apiCall).mockResolvedValueOnce(addResult);

      const result = await api.mcpAdd('new-server', 'stdio', 'node', ['test.js'], {}, undefined, 'local');

      expect(apiCall).toHaveBeenCalledWith('mcp_add', {
        name: 'new-server',
        transport: 'stdio',
        command: 'node',
        args: ['test.js'],
        env: {},
        url: undefined,
        scope: 'local'
      });
      expect(result).toEqual(addResult);
    });

    it('removes MCP server', async () => {
      vi.mocked(apiCall).mockResolvedValueOnce('Server removed successfully');

      const result = await api.mcpRemove('server-name');

      expect(apiCall).toHaveBeenCalledWith('mcp_remove', { name: 'server-name' });
      expect(result).toBe('Server removed successfully');
    });
  });

  describe('Settings Operations', () => {
    it('gets a setting', async () => {
      // getSetting uses storageReadTable internally
      const mockTableData = {
        data: [{ key: 'theme', value: 'dark' }]
      };
      vi.mocked(apiCall).mockResolvedValueOnce(mockTableData);

      const result = await api.getSetting('theme');

      expect(result).toBe('dark');
    });

    it('saves a setting', async () => {
      // saveSetting tries update first, then insert
      vi.mocked(apiCall).mockResolvedValueOnce(undefined);

      await api.saveSetting('theme', 'dark');

      expect(apiCall).toHaveBeenCalled();
    });
  });

  describe('File System Operations', () => {
    it('gets home directory', async () => {
      vi.mocked(apiCall).mockResolvedValueOnce('C:\\Users\\Test');

      const result = await api.getHomeDirectory();

      expect(apiCall).toHaveBeenCalledWith('get_home_directory');
      expect(result).toBe('C:\\Users\\Test');
    });

    it('lists directory with Windows paths', async () => {
      const mockEntries = [
        { name: 'folder', path: 'C:\\test\\folder', is_directory: true, size: 0, extension: undefined },
      ];
      vi.mocked(apiCall).mockResolvedValueOnce(mockEntries);

      const result = await api.listDirectoryContents('C:\\test');

      expect(apiCall).toHaveBeenCalledWith('list_directory_contents', { directoryPath: 'C:\\test' });
      expect(result).toEqual(mockEntries);
    });
  });

  describe('Claude Binary Detection', () => {
    it('checks Claude version', async () => {
      const mockResult = {
        is_installed: true,
        version: '1.0.0',
        output: 'claude 1.0.0'
      };
      vi.mocked(apiCall).mockResolvedValueOnce(mockResult);

      const result = await api.checkClaudeVersion();

      expect(apiCall).toHaveBeenCalledWith('check_claude_version');
      expect(result).toEqual(mockResult);
    });

    it('lists Claude installations on Windows', async () => {
      const mockInstallations = [
        {
          path: 'C:\\Program Files\\Claude\\claude.exe',
          version: '1.0.0',
          source: 'system',
          installation_type: 'System' as const
        },
      ];
      vi.mocked(apiCall).mockResolvedValueOnce(mockInstallations);

      const result = await api.listClaudeInstallations();

      expect(apiCall).toHaveBeenCalledWith('list_claude_installations');
      expect(result).toEqual(mockInstallations);
    });

    it('handles Claude not installed', async () => {
      const mockResult = {
        is_installed: false,
        version: undefined,
        output: 'command not found'
      };
      vi.mocked(apiCall).mockResolvedValueOnce(mockResult);

      const result = await api.checkClaudeVersion();

      expect(result.is_installed).toBe(false);
    });
  });
});
