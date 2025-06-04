// src/app/api/backend/services/llamaService.ts
import { spawn } from 'child_process';
import path from 'path';

interface AIAnalysisResult {
  riskScore: number;
  categories: string[];
  confidence: number;
  explanation: string;
}

export async function analyzeContent(content: string, title: string): Promise<AIAnalysisResult> {
  return new Promise((resolve, reject) => {
    // Path to your Python script
    const pythonScript = path.join(__dirname, 'llamaguard4.py');
    
    // Spawn Python process
    const pythonProcess = spawn('python', [pythonScript, content, title]);

    let result = '';
    let error = '';

    console.log('Starting content analysis...');

    pythonProcess.stdout.on('data', (data) => {
      console.log('Received data from Python:', data.toString());
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python error:', data.toString());
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      console.log('Python process exited with code:', code);
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${error}`));
        return;
      }

      try {
        const analysis = JSON.parse(result);
        console.log('Analysis completed successfully');
        resolve(analysis);
      } catch (e) {
        console.error('Failed to parse Python output:', e);
        reject(new Error('Failed to parse Python script output'));
      }
    });
  });
}