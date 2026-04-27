import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { RealtimeInterviewOrchestrator } from './orchestrator';

interface ExtendedWebSocket extends WebSocket {
  sessionId?: string;
  isAlive?: boolean;
}

export class RealtimeInterviewWebSocketServer {
  private wss: WebSocketServer;
  private orchestrator: RealtimeInterviewOrchestrator;
  private clients: Map<string, ExtendedWebSocket> = new Map();

  constructor(port: number = 3001) {
    this.orchestrator = new RealtimeInterviewOrchestrator();
    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', this.handleConnection.bind(this));

    // Heartbeat to keep connections alive
    setInterval(() => {
      this.wss.clients.forEach((ws: ExtendedWebSocket) => {
        if (!ws.isAlive) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    console.log(`Real-time interview WebSocket server running on port ${port}`);
  }

  private handleConnection(ws: ExtendedWebSocket, request: IncomingMessage) {
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleMessage(ws, message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        this.sendError(ws, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      if (ws.sessionId) {
        this.clients.delete(ws.sessionId);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  private async handleMessage(ws: ExtendedWebSocket, message: any) {
    switch (message.type) {
      case 'start_interview':
        await this.handleStartInterview(ws, message);
        break;
      case 'audio_input':
        await this.handleAudioInput(ws, message);
        break;
      case 'text_answer':
        await this.handleTextAnswer(ws, message);
        break;
      case 'end_interview':
        await this.handleEndInterview(ws, message);
        break;
      default:
        this.sendError(ws, 'Unknown message type');
    }
  }

  private async handleStartInterview(ws: ExtendedWebSocket, message: any) {
    try {
      const { language = 'javascript', mode = 'voice' } = message;

      const session = await this.orchestrator.startInterview(language, mode);
      ws.sessionId = session.sessionId;
      this.clients.set(session.sessionId, ws);

      // Send initial question
      this.sendToClient(session.sessionId, {
        type: 'interview_started',
        state: session.state,
        question: session.firstQuestion
      });

      // If voice mode, start TTS for the first question
      if (mode === 'voice') {
        const audioData = await this.orchestrator.generateSpeech(session.firstQuestion);
        this.sendToClient(session.sessionId, {
          type: 'audio_response',
          audioData: audioData
        });
      }
    } catch (error) {
      console.error('Failed to start interview:', error);
      this.sendError(ws, 'Failed to start interview');
    }
  }

  private async handleAudioInput(ws: ExtendedWebSocket, message: any) {
    if (!ws.sessionId) {
      this.sendError(ws, 'No active session');
      return;
    }

    try {
      const { audioData } = message;

      // Convert audio to text using STT
      const text = await this.orchestrator.speechToText(audioData);

      // Process the answer
      await this.handleTextAnswer(ws, {
        sessionId: ws.sessionId,
        answer: text
      });
    } catch (error) {
      console.error('Failed to process audio input:', error);
      this.sendError(ws, 'Failed to process audio');
    }
  }

  private async handleTextAnswer(ws: ExtendedWebSocket, message: any) {
    if (!ws.sessionId) {
      this.sendError(ws, 'No active session');
      return;
    }

    try {
      const { answer } = message;

      const result = await this.orchestrator.processAnswer(ws.sessionId, answer);

      // Send evaluation feedback
      this.sendToClient(ws.sessionId, {
        type: 'evaluation',
        feedback: result.evaluation.feedback,
        evaluation: result.evaluation
      });

      if (result.isComplete) {
        // Send final evaluation
        this.sendToClient(ws.sessionId, {
          type: 'interview_complete'
        });

        setTimeout(async () => {
          const finalEval = await this.orchestrator.generateFinalEvaluation(ws.sessionId!);
          this.sendToClient(ws.sessionId!, {
            type: 'final_evaluation',
            ...finalEval
          });
        }, 1000);
      } else {
        // Send next question
        this.sendToClient(ws.sessionId, {
          type: 'next_question',
          question: result.nextQuestion
        });

        // Generate speech for next question if in voice mode
        const session = this.orchestrator.getSession(ws.sessionId);
        if (session?.mode === 'voice') {
          const audioData = await this.orchestrator.generateSpeech(result.nextQuestion);
          this.sendToClient(ws.sessionId, {
            type: 'audio_response',
            audioData: audioData
          });
        }
      }
    } catch (error) {
      console.error('Failed to process answer:', error);
      this.sendError(ws, 'Failed to process answer');
    }
  }

  private async handleEndInterview(ws: ExtendedWebSocket, message: any) {
    if (!ws.sessionId) return;

    try {
      const finalEval = await this.orchestrator.generateFinalEvaluation(ws.sessionId);
      this.sendToClient(ws.sessionId, {
        type: 'final_evaluation',
        ...finalEval
      });
    } catch (error) {
      console.error('Failed to end interview:', error);
    } finally {
      this.clients.delete(ws.sessionId);
      ws.sessionId = undefined;
    }
  }

  private sendToClient(sessionId: string, message: any) {
    const client = this.clients.get(sessionId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  private sendError(ws: ExtendedWebSocket, error: string) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'error', message: error }));
    }
  }

  public close() {
    this.wss.close();
  }
}