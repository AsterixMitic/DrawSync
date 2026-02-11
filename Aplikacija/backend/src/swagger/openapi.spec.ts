/**
 * Standalone OpenAPI 3.0 specification for the DrawSync API.
 *
 * This file is completely independent from the application source code.
 * No decorators are required on controllers or DTOs.
 * Edit this file to add/modify endpoints, schemas, or examples.
 */

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'DrawSync API',
    version: '1.0.0',
    description: 'Real-time multiplayer drawing game API. Register, Login, Create room, Join, Start game, Draw & Guess, Complete rounds.',
  },

  servers: [
    { url: 'http://localhost', description: 'Docker (Nginx on port 80)' },
    { url: 'http://localhost:3000', description: 'Local development (no Docker)' },
  ],

  tags: [
    { name: 'Auth', description: 'User registration and authentication' },
    { name: 'Rooms', description: 'Room creation, joining, leaving, and game start' },
    { name: 'Rounds', description: 'Round lifecycle management' },
    { name: 'Guesses', description: 'Submitting guesses during a round' },
    { name: 'Strokes', description: 'Drawing strokes, undo, and canvas clearing' },
  ],

  components: {
    securitySchemes: {
      JWT: {
        type: 'http' as const,
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter the JWT token obtained from POST /api/auth/login',
      },
    },

    schemas: {
      // ─── Error envelope ─────────────────────────────────────
      ErrorResponse: {
        type: 'object' as const,
        properties: {
          success: { type: 'boolean' as const, example: false },
          error: { type: 'string' as const, example: 'Descriptive error message' },
          errorCode: { type: 'string' as const, example: 'VALIDATION_ERROR' },
        },
      },

      // ─── Serialized domain models (private fields with _ prefix) ─
      RoomObject: {
        type: 'object' as const,
        description: 'Serialized Room domain model (private fields)',
        properties: {
          _id: { type: 'string' as const, format: 'uuid', example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
          _status: { type: 'string' as const, enum: ['WAITING', 'IN_PROGRESS', 'FINISHED'], example: 'WAITING' },
          _createdAt: { type: 'string' as const, format: 'date-time', example: '2026-02-11T18:40:31.000Z' },
          _roundCount: { type: 'integer' as const, example: 3 },
          _playerMaxCount: { type: 'integer' as const, example: 8 },
          _roomOwnerId: { type: 'string' as const, format: 'uuid', example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab' },
          _currentRoundId: { type: 'string' as const, format: 'uuid', nullable: true, example: null },
          _players: { type: 'array' as const, items: { $ref: '#/components/schemas/PlayerObject' } },
          _rounds: { type: 'array' as const, items: { $ref: '#/components/schemas/RoundObject' } },
        },
      },

      PlayerObject: {
        type: 'object' as const,
        description: 'Serialized Player domain model',
        properties: {
          _playerId: { type: 'string' as const, format: 'uuid', example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab' },
          _userId: { type: 'string' as const, format: 'uuid', example: '9f8e7d6c-5b4a-3210-fedc-ba9876543210' },
          _roomId: { type: 'string' as const, format: 'uuid', example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
          _score: { type: 'integer' as const, example: 0 },
          _state: { type: 'string' as const, enum: ['WAITING', 'DRAWING', 'GUESSING', 'SPECTATING'], example: 'WAITING' },
        },
      },

      RoundObject: {
        type: 'object' as const,
        description: 'Serialized Round domain model',
        properties: {
          _id: { type: 'string' as const, format: 'uuid', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
          _roundNo: { type: 'integer' as const, example: 1 },
          _roomId: { type: 'string' as const, format: 'uuid', example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
          _status: { type: 'string' as const, enum: ['PENDING', 'ACTIVE', 'COMPLETED'], example: 'ACTIVE' },
          _word: { type: 'string' as const, example: 'sunce' },
          _startedAt: { type: 'string' as const, format: 'date-time', example: '2026-02-11T18:45:00.000Z' },
          _currentDrawerId: { type: 'string' as const, format: 'uuid', nullable: true, example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab' },
          _strokes: { type: 'array' as const, items: { $ref: '#/components/schemas/StrokeObject' } },
          _guesses: { type: 'array' as const, items: { $ref: '#/components/schemas/GuessObject' } },
        },
      },

      GuessObject: {
        type: 'object' as const,
        description: 'Serialized Guess domain model',
        properties: {
          _id: { type: 'string' as const, format: 'uuid', example: 'e5f6a7b8-c9d0-1234-5678-9abcdef01234' },
          _roundId: { type: 'string' as const, format: 'uuid', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
          _playerId: { type: 'string' as const, format: 'uuid', example: 'd4e5f6a7-b8c9-0123-4567-89abcdef0123' },
          _guessText: { type: 'string' as const, example: 'sunce' },
          _time: { type: 'string' as const, format: 'date-time', example: '2026-02-11T18:50:00.000Z' },
          _isCorrect: { type: 'boolean' as const, example: true },
        },
      },

      StrokeObject: {
        type: 'object' as const,
        description: 'Serialized Stroke domain model',
        properties: {
          _id: { type: 'string' as const, format: 'uuid', example: 'f6a7b8c9-d0e1-2345-6789-abcdef012345' },
          _roundId: { type: 'string' as const, format: 'uuid', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
          _createdAt: { type: 'string' as const, format: 'date-time', example: '2026-02-11T18:46:00.000Z' },
          _points: {
            type: 'array' as const,
            items: {
              type: 'object' as const,
              properties: {
                x: { type: 'number' as const, example: 150.5 },
                y: { type: 'number' as const, example: 220.3 },
                pressure: { type: 'number' as const, example: 0.8 },
                timestamp: { type: 'number' as const, example: 1707600000 },
              },
            },
          },
          _style: {
            type: 'object' as const,
            properties: {
              color: { type: 'string' as const, example: '#FF5733' },
              lineWidth: { type: 'number' as const, example: 4 },
              lineCap: { type: 'string' as const, example: 'round' },
              opacity: { type: 'number' as const, example: 1.0 },
            },
          },
        },
      },

      StrokeEventObject: {
        type: 'object' as const,
        description: 'Serialized StrokeEvent domain model',
        properties: {
          _eventId: { type: 'string' as const, format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          _roundId: { type: 'string' as const, format: 'uuid', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
          _seq: { type: 'integer' as const, example: 1 },
          _strokeType: { type: 'string' as const, enum: ['DRAW', 'ERASE', 'CLEAR', 'UNDO'], example: 'DRAW' },
          _createdAt: { type: 'string' as const, format: 'date-time', example: '2026-02-11T18:46:00.000Z' },
          _strokeId: { type: 'string' as const, format: 'uuid', nullable: true, example: 'f6a7b8c9-d0e1-2345-6789-abcdef012345' },
        },
      },

      // ─── Auth schemas (controller maps clean names) ─────────
      UserClean: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const, format: 'uuid', example: '9f8e7d6c-5b4a-3210-fedc-ba9876543210' },
          name: { type: 'string' as const, example: 'Marko Petrovic' },
          email: { type: 'string' as const, format: 'email', example: 'marko@drawsync.com' },
          imgPath: { type: 'string' as const, nullable: true, example: null },
          totalScore: { type: 'integer' as const, example: 0 },
        },
      },

      // ─── Auth request DTOs ──────────────────────────────────
      RegisterRequest: {
        type: 'object' as const,
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string' as const, minLength: 1, description: 'Display name', example: 'Marko Petrovic' },
          email: { type: 'string' as const, format: 'email', description: 'Unique email', example: 'marko@drawsync.com' },
          password: { type: 'string' as const, format: 'password', minLength: 6, example: 'tajna123' },
        },
      },
      RegisterResponse: {
        type: 'object' as const,
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              user: { $ref: '#/components/schemas/UserClean' },
            },
          },
        },
      },

      LoginRequest: {
        type: 'object' as const,
        required: ['email', 'password'],
        properties: {
          email: { type: 'string' as const, format: 'email', example: 'marko@drawsync.com' },
          password: { type: 'string' as const, format: 'password', example: 'tajna123' },
        },
      },
      LoginResponse: {
        type: 'object' as const,
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              accessToken: { type: 'string' as const, example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              user: { $ref: '#/components/schemas/UserClean' },
            },
          },
        },
      },

      // ─── Room request DTOs ──────────────────────────────────
      CreateRoomRequest: {
        type: 'object' as const,
        properties: {
          roundCount: { type: 'integer' as const, minimum: 1, maximum: 10, default: 3, example: 3 },
          playerMaxCount: { type: 'integer' as const, minimum: 2, maximum: 16, default: 8, example: 6 },
        },
      },
      CreateRoomResponse: {
        type: 'object' as const,
        description: 'CreateRoomResultData: { room, player, events }',
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              room: { $ref: '#/components/schemas/RoomObject' },
              player: { $ref: '#/components/schemas/PlayerObject' },
              events: { type: 'array' as const, items: { type: 'object' as const }, description: 'Domain events (RoomCreated, PlayerJoined)' },
            },
          },
        },
      },

      JoinRoomResponse: {
        type: 'object' as const,
        description: 'JoinRoomResultData: { room, player, events }',
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              room: { $ref: '#/components/schemas/RoomObject' },
              player: { $ref: '#/components/schemas/PlayerObject' },
              events: { type: 'array' as const, items: { type: 'object' as const } },
            },
          },
        },
      },

      LeaveRoomRequest: {
        type: 'object' as const,
        required: ['playerId'],
        properties: {
          playerId: { type: 'string' as const, format: 'uuid', example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab' },
        },
      },
      LeaveRoomResponse: {
        type: 'object' as const,
        description: 'LeaveRoomResultData: { room, removedPlayer, newOwnerId, roomDeleted, events }',
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              room: { $ref: '#/components/schemas/RoomObject' },
              removedPlayer: { $ref: '#/components/schemas/PlayerObject' },
              newOwnerId: { type: 'string' as const, format: 'uuid', nullable: true, example: null },
              roomDeleted: { type: 'boolean' as const, example: false },
              events: { type: 'array' as const, items: { type: 'object' as const } },
            },
          },
        },
      },

      StartGameRequest: {
        type: 'object' as const,
        required: ['words'],
        properties: {
          words: {
            type: 'array' as const,
            items: { type: 'string' as const },
            minItems: 1,
            example: ['sunce', 'macka', 'planina', 'avion', 'gitara'],
          },
        },
      },
      StartGameResponse: {
        type: 'object' as const,
        description: 'StartGameResultData (from workflow): { roomId, firstRound, drawerId, events }',
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              roomId: { type: 'string' as const, format: 'uuid', example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
              firstRound: { $ref: '#/components/schemas/RoundObject' },
              drawerId: { type: 'string' as const, format: 'uuid', example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab' },
              events: { type: 'array' as const, items: { type: 'object' as const } },
            },
          },
        },
      },

      // ─── Round DTOs ─────────────────────────────────────────
      StartRoundRequest: {
        type: 'object' as const,
        required: ['word'],
        properties: {
          word: { type: 'string' as const, minLength: 2, example: 'macka' },
        },
      },
      StartRoundResponse: {
        type: 'object' as const,
        description: 'StartRoundResultData: { round, drawerId, playerStates, events }',
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              round: { $ref: '#/components/schemas/RoundObject' },
              drawerId: { type: 'string' as const, format: 'uuid', example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab' },
              playerStates: {
                type: 'array' as const,
                items: {
                  type: 'object' as const,
                  properties: {
                    playerId: { type: 'string' as const, format: 'uuid' },
                    state: { type: 'string' as const, enum: ['WAITING', 'DRAWING', 'GUESSING', 'SPECTATING'] },
                  },
                },
                example: [
                  { playerId: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab', state: 'DRAWING' },
                  { playerId: 'd4e5f6a7-b8c9-0123-4567-89abcdef0123', state: 'GUESSING' },
                ],
              },
              events: { type: 'array' as const, items: { type: 'object' as const } },
            },
          },
        },
      },

      CompleteRoundResponse: {
        type: 'object' as const,
        description: 'CompleteRoundResultData: { round, roomStatus, events }',
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              round: { $ref: '#/components/schemas/RoundObject' },
              roomStatus: { type: 'string' as const, enum: ['WAITING', 'IN_PROGRESS', 'FINISHED'], example: 'IN_PROGRESS' },
              events: { type: 'array' as const, items: { type: 'object' as const } },
            },
          },
        },
      },

      // ─── Guess DTOs ─────────────────────────────────────────
      SubmitGuessRequest: {
        type: 'object' as const,
        required: ['roundId', 'playerId', 'guessText'],
        properties: {
          roundId: { type: 'string' as const, format: 'uuid', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
          playerId: { type: 'string' as const, format: 'uuid', example: 'd4e5f6a7-b8c9-0123-4567-89abcdef0123' },
          guessText: { type: 'string' as const, example: 'sunce' },
        },
      },
      SubmitGuessResponse: {
        type: 'object' as const,
        description: 'SubmitGuessResultData: { guess, isCorrect, pointsAwarded, events }',
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              guess: { $ref: '#/components/schemas/GuessObject' },
              isCorrect: { type: 'boolean' as const, example: true },
              pointsAwarded: { type: 'integer' as const, example: 100 },
              events: { type: 'array' as const, items: { type: 'object' as const } },
            },
          },
        },
      },

      // ─── Stroke DTOs ───────────────────────────────────────
      StrokePointInput: {
        type: 'object' as const,
        required: ['x', 'y'],
        properties: {
          x: { type: 'number' as const, example: 150.5 },
          y: { type: 'number' as const, example: 220.3 },
          pressure: { type: 'number' as const, example: 0.8 },
          timestamp: { type: 'integer' as const, example: 1707600000 },
        },
      },
      StrokeStyleInput: {
        type: 'object' as const,
        required: ['color', 'lineWidth'],
        properties: {
          color: { type: 'string' as const, example: '#FF5733' },
          lineWidth: { type: 'integer' as const, minimum: 1, example: 4 },
          lineCap: { type: 'string' as const, enum: ['round', 'square', 'butt'], example: 'round' },
          opacity: { type: 'number' as const, example: 1.0 },
        },
      },

      ApplyStrokeRequest: {
        type: 'object' as const,
        required: ['playerId', 'points', 'style'],
        properties: {
          playerId: { type: 'string' as const, format: 'uuid', example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab' },
          points: {
            type: 'array' as const,
            items: { $ref: '#/components/schemas/StrokePointInput' },
            minItems: 1,
            example: [
              { x: 100, y: 200, pressure: 0.5, timestamp: 1707600000 },
              { x: 120, y: 210, pressure: 0.7, timestamp: 1707600016 },
              { x: 150, y: 220, pressure: 0.8, timestamp: 1707600032 },
            ],
          },
          style: { $ref: '#/components/schemas/StrokeStyleInput' },
        },
      },
      ApplyStrokeResponse: {
        type: 'object' as const,
        description: 'ApplyStrokeResultData: { stroke, strokeEvent, events }',
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              stroke: { $ref: '#/components/schemas/StrokeObject' },
              strokeEvent: { $ref: '#/components/schemas/StrokeEventObject' },
              events: { type: 'array' as const, items: { type: 'object' as const } },
            },
          },
        },
      },

      StrokeActionRequest: {
        type: 'object' as const,
        required: ['playerId'],
        properties: {
          playerId: { type: 'string' as const, format: 'uuid', example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab' },
        },
      },
      UndoStrokeResponse: {
        type: 'object' as const,
        description: 'UndoStrokeResultData: { strokeEvent, undoneStrokeId, events }',
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              strokeEvent: { $ref: '#/components/schemas/StrokeEventObject' },
              undoneStrokeId: { type: 'string' as const, format: 'uuid', nullable: true, example: 'f6a7b8c9-d0e1-2345-6789-abcdef012345' },
              events: { type: 'array' as const, items: { type: 'object' as const } },
            },
          },
        },
      },
      ClearCanvasResponse: {
        type: 'object' as const,
        description: 'ClearCanvasResultData: { strokeEvent, events }',
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              strokeEvent: { $ref: '#/components/schemas/StrokeEventObject' },
              events: { type: 'array' as const, items: { type: 'object' as const } },
            },
          },
        },
      },
    },
  },

  // ════════════════════════════════════════════════════════════
  //  PATHS
  // ════════════════════════════════════════════════════════════
  paths: {
    // ─── AUTH ──────────────────────────────────────────────
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Creates a new user account. **Public** endpoint -- no JWT required.',
        operationId: 'register',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: {
          '201': { description: 'User created', content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterResponse' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Name must be at least 2 characters', errorCode: 'VALIDATION_ERROR' } } } },
          '409': { description: 'Email already taken', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Email is already registered', errorCode: 'EMAIL_TAKEN' } } } },
        },
      },
    },

    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive JWT',
        description: 'Authenticates a user and returns a JWT access token. **Public** endpoint. Copy the `accessToken` and use the Authorize button.',
        operationId: 'login',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          '200': { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Invalid email or password', errorCode: 'INVALID_CREDENTIALS' } } } },
        },
      },
    },

    // ─── ROOMS ─────────────────────────────────────────────
    '/api/rooms': {
      post: {
        tags: ['Rooms'],
        summary: 'Create a new room',
        description: 'Creates a game room. The authenticated user becomes the room owner and first player. Returns the full Room and Player objects.',
        operationId: 'createRoom',
        security: [{ JWT: [] }],
        requestBody: {
          required: false,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRoomRequest' } } },
        },
        responses: {
          '201': { description: 'Room created', content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRoomResponse' } } } },
          '401': { description: 'Missing or invalid JWT', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '404': { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/api/rooms/{roomId}/join': {
      post: {
        tags: ['Rooms'],
        summary: 'Join an existing room',
        description: 'Adds the authenticated user as a player. Returns the Room (with updated player list) and the new Player.',
        operationId: 'joinRoom',
        security: [{ JWT: [] }],
        parameters: [
          { name: 'roomId', in: 'path' as const, required: true, schema: { type: 'string' as const, format: 'uuid' }, example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
        ],
        responses: {
          '200': { description: 'Joined successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/JoinRoomResponse' } } } },
          '404': { description: 'Room not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '409': { description: 'Already joined / Room full', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '422': { description: 'Room not in WAITING status', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/api/rooms/{roomId}/leave': {
      post: {
        tags: ['Rooms'],
        summary: 'Leave a room',
        description: 'Removes a player. Ownership transfers if owner leaves. Room deleted if last player leaves.',
        operationId: 'leaveRoom',
        security: [{ JWT: [] }],
        parameters: [
          { name: 'roomId', in: 'path' as const, required: true, schema: { type: 'string' as const, format: 'uuid' }, example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LeaveRoomRequest' } } },
        },
        responses: {
          '200': { description: 'Left the room', content: { 'application/json': { schema: { $ref: '#/components/schemas/LeaveRoomResponse' } } } },
          '404': { description: 'Room or player not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/api/rooms/{roomId}/start': {
      post: {
        tags: ['Rooms'],
        summary: 'Start the game',
        description: 'Starts the game with a word list. Uses the StartGameWorkflow which starts the game and begins the first round automatically.',
        operationId: 'startGame',
        security: [{ JWT: [] }],
        parameters: [
          { name: 'roomId', in: 'path' as const, required: true, schema: { type: 'string' as const, format: 'uuid' }, example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/StartGameRequest' } } },
        },
        responses: {
          '200': { description: 'Game started, first round begun', content: { 'application/json': { schema: { $ref: '#/components/schemas/StartGameResponse' } } } },
          '404': { description: 'Room not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '422': { description: 'Invalid state (already started, not enough players)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    // ─── ROUNDS ────────────────────────────────────────────
    '/api/rooms/{roomId}/rounds/start': {
      post: {
        tags: ['Rounds'],
        summary: 'Start a new round',
        description: 'Starts the next round with a given word. A drawer is selected round-robin. Returns the Round, drawerId, and all player states.',
        operationId: 'startRound',
        security: [{ JWT: [] }],
        parameters: [
          { name: 'roomId', in: 'path' as const, required: true, schema: { type: 'string' as const, format: 'uuid' }, example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/StartRoundRequest' } } },
        },
        responses: {
          '200': { description: 'Round started', content: { 'application/json': { schema: { $ref: '#/components/schemas/StartRoundResponse' } } } },
          '422': { description: 'Invalid state (game not started, another round active)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/api/rooms/{roomId}/rounds/complete': {
      post: {
        tags: ['Rounds'],
        summary: 'Complete the current round',
        description: 'Ends the active round. Returns the completed Round and current room status (IN_PROGRESS or FINISHED if all rounds done).',
        operationId: 'completeRound',
        security: [{ JWT: [] }],
        parameters: [
          { name: 'roomId', in: 'path' as const, required: true, schema: { type: 'string' as const, format: 'uuid' }, example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
        ],
        responses: {
          '200': { description: 'Round completed', content: { 'application/json': { schema: { $ref: '#/components/schemas/CompleteRoundResponse' } } } },
          '422': { description: 'No active round', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    // ─── GUESSES ───────────────────────────────────────────
    '/api/rooms/{roomId}/guesses': {
      post: {
        tags: ['Guesses'],
        summary: 'Submit a guess',
        description: 'Submit a word guess. Returns the Guess object, whether it was correct, and points awarded (100/80/60/40/20 decreasing).',
        operationId: 'submitGuess',
        security: [{ JWT: [] }],
        parameters: [
          { name: 'roomId', in: 'path' as const, required: true, schema: { type: 'string' as const, format: 'uuid' }, example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SubmitGuessRequest' } } },
        },
        responses: {
          '200': { description: 'Guess processed', content: { 'application/json': { schema: { $ref: '#/components/schemas/SubmitGuessResponse' } } } },
          '403': { description: 'Drawer cannot guess', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Drawer cannot guess', errorCode: 'NOT_AUTHORIZED' } } } },
          '409': { description: 'Already guessed correctly', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Player has already guessed correctly', errorCode: 'ALREADY_GUESSED' } } } },
          '422': { description: 'Round not active', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    // ─── STROKES ───────────────────────────────────────────
    '/api/rooms/{roomId}/strokes': {
      post: {
        tags: ['Strokes'],
        summary: 'Apply a drawing stroke',
        description: 'The drawer sends a stroke (points + style). Returns the Stroke and its StrokeEvent (event-sourcing log entry).',
        operationId: 'applyStroke',
        security: [{ JWT: [] }],
        parameters: [
          { name: 'roomId', in: 'path' as const, required: true, schema: { type: 'string' as const, format: 'uuid' }, example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApplyStrokeRequest' } } },
        },
        responses: {
          '201': { description: 'Stroke applied', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApplyStrokeResponse' } } } },
          '403': { description: 'Not the drawer', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Only the current drawer can apply strokes', errorCode: 'NOT_AUTHORIZED' } } } },
          '422': { description: 'Round not active', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/api/rooms/{roomId}/strokes/undo': {
      post: {
        tags: ['Strokes'],
        summary: 'Undo the last stroke',
        description: 'Undoes the most recent DRAW stroke (computed via event log stack). Returns the undo StrokeEvent and the undone stroke ID.',
        operationId: 'undoStroke',
        security: [{ JWT: [] }],
        parameters: [
          { name: 'roomId', in: 'path' as const, required: true, schema: { type: 'string' as const, format: 'uuid' }, example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/StrokeActionRequest' } } },
        },
        responses: {
          '200': { description: 'Stroke undone', content: { 'application/json': { schema: { $ref: '#/components/schemas/UndoStrokeResponse' } } } },
          '403': { description: 'Not the drawer', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '422': { description: 'Nothing to undo / Round not active', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/api/rooms/{roomId}/strokes/clear': {
      post: {
        tags: ['Strokes'],
        summary: 'Clear the entire canvas',
        description: 'Clears all strokes. Returns the CLEAR StrokeEvent log entry.',
        operationId: 'clearCanvas',
        security: [{ JWT: [] }],
        parameters: [
          { name: 'roomId', in: 'path' as const, required: true, schema: { type: 'string' as const, format: 'uuid' }, example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/StrokeActionRequest' } } },
        },
        responses: {
          '200': { description: 'Canvas cleared', content: { 'application/json': { schema: { $ref: '#/components/schemas/ClearCanvasResponse' } } } },
          '403': { description: 'Not the drawer', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '422': { description: 'Round not active', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
};
