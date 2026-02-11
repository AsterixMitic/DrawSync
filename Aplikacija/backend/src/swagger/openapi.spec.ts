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
    description: 'Real-time multiplayer drawing game API. Register → Login → Create room → Join → Start game → Draw & Guess → Complete rounds.',
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
      // ─── Reusable error envelope ────────────────────────────
      ErrorResponse: {
        type: 'object' as const,
        properties: {
          success: { type: 'boolean' as const, example: false },
          error: { type: 'string' as const, example: 'Descriptive error message' },
          errorCode: { type: 'string' as const, example: 'VALIDATION_ERROR' },
        },
      },

      // ─── User ───────────────────────────────────────────────
      User: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const, format: 'uuid', example: '9f8e7d6c-5b4a-3210-fedc-ba9876543210' },
          name: { type: 'string' as const, example: 'Marko Petrovic' },
          email: { type: 'string' as const, format: 'email', example: 'marko@drawsync.com' },
          imgPath: { type: 'string' as const, nullable: true, example: null },
          totalScore: { type: 'integer' as const, example: 0 },
        },
      },

      // ─── Auth DTOs ──────────────────────────────────────────
      RegisterRequest: {
        type: 'object' as const,
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string' as const, minLength: 1, description: 'Display name', example: 'Marko Petrovic' },
          email: { type: 'string' as const, format: 'email', description: 'Unique email address', example: 'marko@drawsync.com' },
          password: { type: 'string' as const, format: 'password', minLength: 6, description: 'Minimum 6 characters', example: 'tajna123' },
        },
      },
      RegisterResponse: {
        type: 'object' as const,
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              user: { $ref: '#/components/schemas/User' },
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
              accessToken: { type: 'string' as const, example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5ZjhlN2Q2Yy01YjRhLTMyMTAtZmVkYy1iYTk4NzY1NDMyMTAiLCJpYXQiOjE3MDc2MDAwMDB9.SIGNATURE' },
              user: { $ref: '#/components/schemas/User' },
            },
          },
        },
      },

      // ─── Room DTOs ──────────────────────────────────────────
      CreateRoomRequest: {
        type: 'object' as const,
        properties: {
          roundCount: { type: 'integer' as const, minimum: 1, maximum: 10, default: 3, description: 'Number of rounds', example: 3 },
          playerMaxCount: { type: 'integer' as const, minimum: 2, maximum: 16, default: 8, description: 'Max players', example: 6 },
        },
      },
      CreateRoomResponse: {
        type: 'object' as const,
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              roomId: { type: 'string' as const, format: 'uuid', example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
              roomOwnerId: { type: 'string' as const, format: 'uuid', example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab' },
              playerId: { type: 'string' as const, format: 'uuid', example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab' },
              roundCount: { type: 'integer' as const, example: 3 },
              playerMaxCount: { type: 'integer' as const, example: 6 },
              status: { type: 'string' as const, example: 'WAITING' },
            },
          },
        },
      },

      JoinRoomResponse: {
        type: 'object' as const,
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              playerId: { type: 'string' as const, format: 'uuid', example: 'd4e5f6a7-b8c9-0123-4567-89abcdef0123' },
              roomId: { type: 'string' as const, format: 'uuid', example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
              playerName: { type: 'string' as const, example: 'Ana Jovanovic' },
            },
          },
        },
      },

      LeaveRoomRequest: {
        type: 'object' as const,
        required: ['playerId'],
        properties: {
          playerId: { type: 'string' as const, format: 'uuid', description: 'ID of the player leaving', example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab' },
        },
      },
      LeaveRoomResponse: {
        type: 'object' as const,
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              roomId: { type: 'string' as const, format: 'uuid', example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
              playerId: { type: 'string' as const, format: 'uuid', example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab' },
              newOwnerId: { type: 'string' as const, format: 'uuid', nullable: true, example: 'd4e5f6a7-b8c9-0123-4567-89abcdef0123' },
              roomDeleted: { type: 'boolean' as const, example: false },
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
            description: 'One word per round (at least as many as roundCount)',
            example: ['sunce', 'macka', 'planina', 'avion', 'gitara'],
          },
        },
      },
      StartGameResponse: {
        type: 'object' as const,
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              roomId: { type: 'string' as const, format: 'uuid', example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
              roundId: { type: 'string' as const, format: 'uuid', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
              drawerId: { type: 'string' as const, format: 'uuid', example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab' },
              word: { type: 'string' as const, example: 'sunce' },
              roundNumber: { type: 'integer' as const, example: 1 },
            },
          },
        },
      },

      // ─── Round DTOs ─────────────────────────────────────────
      StartRoundRequest: {
        type: 'object' as const,
        required: ['word'],
        properties: {
          word: { type: 'string' as const, minLength: 2, description: 'The secret word to draw', example: 'macka' },
        },
      },
      StartRoundResponse: {
        type: 'object' as const,
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              roundId: { type: 'string' as const, format: 'uuid', example: 'a1234567-b890-cdef-1234-567890abcdef' },
              roomId: { type: 'string' as const, format: 'uuid', example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
              drawerId: { type: 'string' as const, format: 'uuid', example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab' },
              word: { type: 'string' as const, example: 'macka' },
              roundNumber: { type: 'integer' as const, example: 2 },
            },
          },
        },
      },

      CompleteRoundResponse: {
        type: 'object' as const,
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              roundId: { type: 'string' as const, format: 'uuid', example: 'a1234567-b890-cdef-1234-567890abcdef' },
              roomId: { type: 'string' as const, format: 'uuid', example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
              correctWord: { type: 'string' as const, example: 'macka' },
              scores: {
                type: 'array' as const,
                items: {
                  type: 'object' as const,
                  properties: {
                    playerId: { type: 'string' as const, format: 'uuid' },
                    playerName: { type: 'string' as const },
                    pointsEarned: { type: 'integer' as const },
                    totalScore: { type: 'integer' as const },
                  },
                },
                example: [
                  { playerId: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab', playerName: 'Marko Petrovic', pointsEarned: 50, totalScore: 150 },
                  { playerId: 'd4e5f6a7-b8c9-0123-4567-89abcdef0123', playerName: 'Ana Jovanovic', pointsEarned: 100, totalScore: 250 },
                ],
              },
            },
          },
        },
      },

      // ─── Guess DTOs ─────────────────────────────────────────
      SubmitGuessRequest: {
        type: 'object' as const,
        required: ['roundId', 'playerId', 'guessText'],
        properties: {
          roundId: { type: 'string' as const, format: 'uuid', description: 'Current round ID', example: 'a1234567-b890-cdef-1234-567890abcdef' },
          playerId: { type: 'string' as const, format: 'uuid', description: 'Your player ID in this room', example: 'd4e5f6a7-b8c9-0123-4567-89abcdef0123' },
          guessText: { type: 'string' as const, description: 'Your guess', example: 'sunce' },
        },
      },
      SubmitGuessResponse: {
        type: 'object' as const,
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              guessId: { type: 'string' as const, format: 'uuid', example: 'e5f6a7b8-c9d0-1234-5678-9abcdef01234' },
              isCorrect: { type: 'boolean' as const, example: true },
              pointsAwarded: { type: 'integer' as const, example: 100 },
              guessText: { type: 'string' as const, example: 'sunce' },
            },
          },
        },
      },

      // ─── Stroke DTOs ───────────────────────────────────────
      StrokePoint: {
        type: 'object' as const,
        required: ['x', 'y'],
        properties: {
          x: { type: 'number' as const, description: 'X coordinate', example: 150.5 },
          y: { type: 'number' as const, description: 'Y coordinate', example: 220.3 },
          pressure: { type: 'number' as const, minimum: 0, maximum: 1, description: 'Pen pressure (optional)', example: 0.8 },
          timestamp: { type: 'integer' as const, description: 'Timestamp in ms (optional)', example: 1707600000 },
        },
      },
      StrokeStyle: {
        type: 'object' as const,
        required: ['color', 'lineWidth'],
        properties: {
          color: { type: 'string' as const, description: 'CSS color / hex', example: '#FF5733' },
          lineWidth: { type: 'integer' as const, minimum: 1, description: 'Line width in px', example: 4 },
          lineCap: { type: 'string' as const, enum: ['round', 'square', 'butt'], description: 'Line cap style', example: 'round' },
          opacity: { type: 'number' as const, minimum: 0, maximum: 1, description: 'Opacity 0-1', example: 1.0 },
        },
      },

      ApplyStrokeRequest: {
        type: 'object' as const,
        required: ['playerId', 'points', 'style'],
        properties: {
          playerId: { type: 'string' as const, format: 'uuid', description: 'Drawer player ID', example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab' },
          points: {
            type: 'array' as const,
            items: { $ref: '#/components/schemas/StrokePoint' },
            minItems: 1,
            description: 'Points forming the stroke path',
            example: [
              { x: 100, y: 200, pressure: 0.5, timestamp: 1707600000 },
              { x: 120, y: 210, pressure: 0.7, timestamp: 1707600016 },
              { x: 150, y: 220, pressure: 0.8, timestamp: 1707600032 },
            ],
          },
          style: { $ref: '#/components/schemas/StrokeStyle' },
        },
      },
      ApplyStrokeResponse: {
        type: 'object' as const,
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              strokeId: { type: 'string' as const, format: 'uuid', example: 'f6a7b8c9-d0e1-2345-6789-abcdef012345' },
              seq: { type: 'integer' as const, description: 'Sequence number within the round', example: 1 },
            },
          },
        },
      },

      StrokeActionRequest: {
        type: 'object' as const,
        required: ['playerId'],
        properties: {
          playerId: { type: 'string' as const, format: 'uuid', description: 'Drawer player ID', example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab' },
        },
      },
      UndoStrokeResponse: {
        type: 'object' as const,
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              undoneStrokeId: { type: 'string' as const, format: 'uuid', example: 'f6a7b8c9-d0e1-2345-6789-abcdef012345' },
              remainingStrokes: { type: 'integer' as const, example: 2 },
            },
          },
        },
      },
      ClearCanvasResponse: {
        type: 'object' as const,
        properties: {
          success: { type: 'boolean' as const, example: true },
          data: {
            type: 'object' as const,
            properties: {
              clearedCount: { type: 'integer' as const, description: 'Number of strokes cleared', example: 5 },
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
        description: 'Creates a new user account. This is a **public** endpoint — no JWT required.',
        operationId: 'register',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterResponse' } } },
          },
          '400': {
            description: 'Validation error (missing fields, short password, invalid email)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Password must be at least 6 characters', errorCode: 'VALIDATION_ERROR' } } },
          },
          '409': {
            description: 'Email already taken',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'A user with this email already exists', errorCode: 'EMAIL_TAKEN' } } },
          },
        },
      },
    },

    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive JWT',
        description: 'Authenticates a user and returns a JWT access token. This is a **public** endpoint.\n\nCopy the `accessToken` from the response and use the **Authorize** button above.',
        operationId: 'login',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          '200': {
            description: 'Login successful — token returned',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
          },
          '401': {
            description: 'Invalid credentials',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Invalid email or password', errorCode: 'INVALID_CREDENTIALS' } } },
          },
        },
      },
    },

    // ─── ROOMS ─────────────────────────────────────────────
    '/api/rooms': {
      post: {
        tags: ['Rooms'],
        summary: 'Create a new room',
        description: 'Creates a game room. The authenticated user becomes the room owner and the first player.',
        operationId: 'createRoom',
        security: [{ JWT: [] }],
        requestBody: {
          required: false,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRoomRequest' } } },
        },
        responses: {
          '201': {
            description: 'Room created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRoomResponse' } } },
          },
          '401': { description: 'Missing or invalid JWT', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/api/rooms/{roomId}/join': {
      post: {
        tags: ['Rooms'],
        summary: 'Join an existing room',
        description: 'Adds the authenticated user as a player to the room. Fails if the room is full or the game has started.',
        operationId: 'joinRoom',
        security: [{ JWT: [] }],
        parameters: [
          { name: 'roomId', in: 'path' as const, required: true, schema: { type: 'string' as const, format: 'uuid' }, description: 'Room ID to join', example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
        ],
        responses: {
          '200': {
            description: 'Joined successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/JoinRoomResponse' } } },
          },
          '404': { description: 'Room not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Room not found', errorCode: 'NOT_FOUND' } } } },
          '409': {
            description: 'Already joined / Room full',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  already_joined: { summary: 'Player already in room', value: { success: false, error: 'You have already joined this room', errorCode: 'ALREADY_JOINED' } },
                  room_full: { summary: 'Room is full', value: { success: false, error: 'Room is full', errorCode: 'ROOM_FULL' } },
                },
              },
            },
          },
        },
      },
    },

    '/api/rooms/{roomId}/leave': {
      post: {
        tags: ['Rooms'],
        summary: 'Leave a room',
        description: 'Removes a player from the room. If the owner leaves, ownership transfers. If the last player leaves, the room is deleted.',
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
        description: 'The room owner starts the game by providing a list of words (one per round). The first round starts automatically.',
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
          '422': {
            description: 'Invalid state (e.g. game already started, not enough players)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Game has already started', errorCode: 'INVALID_STATE' } } },
          },
        },
      },
    },

    // ─── ROUNDS ────────────────────────────────────────────
    '/api/rooms/{roomId}/rounds/start': {
      post: {
        tags: ['Rounds'],
        summary: 'Start a new round',
        description: 'Begins the next round in the room with a given word. A drawer is selected from the players.',
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
          '422': { description: 'Invalid state (e.g. previous round not completed)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/api/rooms/{roomId}/rounds/complete': {
      post: {
        tags: ['Rounds'],
        summary: 'Complete the current round',
        description: 'Ends the active round, tallies scores, and reveals the correct word.',
        operationId: 'completeRound',
        security: [{ JWT: [] }],
        parameters: [
          { name: 'roomId', in: 'path' as const, required: true, schema: { type: 'string' as const, format: 'uuid' }, example: 'b5a4c3d2-e1f0-9876-5432-10fedcba9876' },
        ],
        responses: {
          '200': { description: 'Round completed with scores', content: { 'application/json': { schema: { $ref: '#/components/schemas/CompleteRoundResponse' } } } },
          '422': { description: 'No active round to complete', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    // ─── GUESSES ───────────────────────────────────────────
    '/api/rooms/{roomId}/guesses': {
      post: {
        tags: ['Guesses'],
        summary: 'Submit a guess',
        description: 'A guesser submits their word guess for the current round. Returns whether it was correct and any points awarded.',
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
          '403': { description: 'Drawer cannot guess', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'The drawer cannot submit guesses', errorCode: 'NOT_AUTHORIZED' } } } },
          '409': { description: 'Already guessed correctly', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'You have already guessed correctly', errorCode: 'ALREADY_GUESSED' } } } },
          '422': { description: 'Round not active', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    // ─── STROKES ───────────────────────────────────────────
    '/api/rooms/{roomId}/strokes': {
      post: {
        tags: ['Strokes'],
        summary: 'Apply a drawing stroke',
        description: 'The drawer sends a stroke (array of points + style). Only the current drawer can draw.',
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
          '403': { description: 'Not the drawer', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Only the drawer can apply strokes', errorCode: 'NOT_AUTHORIZED' } } } },
          '422': { description: 'No active round', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/api/rooms/{roomId}/strokes/undo': {
      post: {
        tags: ['Strokes'],
        summary: 'Undo the last stroke',
        description: 'The drawer undoes their most recent stroke.',
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
          '422': { description: 'Nothing to undo / No active round', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/api/rooms/{roomId}/strokes/clear': {
      post: {
        tags: ['Strokes'],
        summary: 'Clear the entire canvas',
        description: 'The drawer clears all strokes from the canvas.',
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
          '422': { description: 'No active round', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
};
