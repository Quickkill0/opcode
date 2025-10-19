#!/usr/bin/env python3
"""
Permission proxy hook for Claude Code.
This script intercepts tool calls and requests approval from the permission server.
"""
import os
import sys
import json
import requests
import uuid

def main():
    # Read tool call from stdin
    tool_call_str = sys.stdin.read()

    try:
        tool_call = json.loads(tool_call_str)
    except json.JSONDecodeError as e:
        print(f"Error parsing tool call: {e}", file=sys.stderr)
        sys.exit(1)

    # Extract tool and path from the tool call
    tool = tool_call.get('tool', 'Unknown')

    # Different tools store the path in different places
    if tool == 'Bash':
        path = tool_call.get('input', {}).get('command', '')
    else:
        # Try common path fields
        path = (
            tool_call.get('path') or
            tool_call.get('input', {}).get('file_path') or
            tool_call.get('input', {}).get('path') or
            ''
        )

    # Generate request ID
    request_id = str(uuid.uuid4())
    session_id = os.environ.get('CLAUDE_SESSION_ID', 'unknown')

    # Get server port from command line argument
    server_port = sys.argv[1] if len(sys.argv) > 1 else '8765'

    try:
        # Send permission request to server
        response = requests.post(
            f'http://localhost:{server_port}/permission-request',
            json={
                'id': request_id,
                'session_id': session_id,
                'tool': tool,
                'path': path,
                'input': tool_call.get('input'),
            },
            timeout=300  # 5 minute timeout
        )

        result = response.json()

        # Exit with 0 for approve, 1 for deny
        if result.get('decision') == 'approve':
            sys.exit(0)
        else:
            sys.exit(1)

    except requests.exceptions.RequestException as e:
        print(f"Error communicating with permission server: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
