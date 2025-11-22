require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

// Execute Claude Code command and return result
app.post('/api/claude', async (req, res) => {
  const { prompt, workingDir } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  console.log(`\n--- Claude Code Request ---`);
  console.log(`Prompt: ${prompt}`);
  console.log(`Working Dir: ${workingDir || 'default'}`);

  try {
    const cwd = workingDir || process.env.USERPROFILE || process.env.HOME;
    const args = ['-p', prompt, '--dangerously-skip-permissions', '--output-format', 'json'];

    console.log(`[spawn] Command: claude ${args.join(' ')}`);
    console.log(`[spawn] CWD: ${cwd}`);

    const proc = spawn('claude', args, {
      cwd: cwd,
      stdio: ['inherit', 'pipe', 'pipe'],  // Key fix: stdin must be 'inherit'
    });

    let stdout = '';
    let stderr = '';
    let responded = false;

    const timeout = setTimeout(() => {
      if (!responded) {
        responded = true;
        proc.kill();
        res.status(504).json({
          error: 'Request timed out after 2 minutes',
          response: stdout.trim(),
          stderr: stderr.trim()
        });
      }
    }, 120000);

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (!responded) {
        responded = true;
        clearTimeout(timeout);
        console.log(`Exit code: ${code}`);
        console.log(`Response length: ${stdout.length} chars`);

        // Parse JSON output if possible
        let response = stdout.trim();
        try {
          const parsed = JSON.parse(response);
          response = parsed.result || parsed.content || response;
        } catch (e) {
          // Keep as plain text
        }

        res.json({
          response: response,
          stderr: stderr.trim(),
          exitCode: code
        });
      }
    });

    proc.on('error', (err) => {
      if (!responded) {
        responded = true;
        clearTimeout(timeout);
        console.error('Spawn error:', err);
        res.status(500).json({
          error: `Failed to run Claude Code: ${err.message}`
        });
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Send prompts to POST /api/claude`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
