// --- Game State Variables ---
let board = []; // 2D array representing the chessboard
let selectedSquareId = null; // Stores the id of the currently selected square (e.g., 'a1')
let legalMoves = []; // Stores IDs of squares where the selected piece can move (for highlighting)
let moveHistory = []; // Stores moves in a simple format (for UI display)
let turn = 'white'; // 'white' or 'black'
let moveNumber = 1;
let whiteKingPos = [7, 4]; // [row, col]
let blackKingPos = [0, 4]; // [row, col]
let canWhiteCastleKingside = true;
let canWhiteCastleQueenside = true;
let canBlackCastleKingside = true;
let canBlackCastleQueenside = true;
let enPassantTargetSquare = null; // e.g., 'e3' if a pawn moved from e2 to e4
let halfmoveClock = 0; // For 50-move rule
let boardHistory = []; // To store FEN-like strings for Threefold Repetition

// Variables for Undo/Redo
let gameStates = []; // Array to store snapshots of the game state
let currentStateIndex = -1; // Index of the current state in gameStates

// Variables for Timers
let whiteTime = 10 * 60; // 5 minutes in seconds
let blackTime = 10 * 60; // 5 minutes in seconds
let timerInterval = null; // Holds the interval ID for the timer
let gameActive = false; // Flag to indicate if the game is ongoing (for timers)

// --- New Variables for Home Page and Modes ---
let currentPlayerColor = 'white'; // User's chosen color ('white' or 'black')
let currentGameMode = 'timer'; // 'timer' or 'normal'
const homePage = document.getElementById('home-page');
const gamePage = document.getElementById('game-page');


// Unicode chess piece symbols
const PIECES = {
    'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚', 'P': '♟', // Black pieces
    'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔', 'p': '♙'  // White pieces
};

// Initial board setup (FEN-like representation for simplicity)
const initialBoardFen = [
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
];

// --- DOM Elements ---
const chessboardElement = document.getElementById('chessboard');
const movesListElement = document.getElementById('moves-list');
const statusMessageElement = document.getElementById('status-message');
const newGameButton = document.getElementById('new-game-button');
const resignButton = document.getElementById('resign-button');
const offerDrawButton = document.getElementById('offer-draw-button');
const undoButton = document.getElementById('undo-button');
const redoButton = document.getElementById('redo-button');
const whiteTimerDisplay = document.getElementById('white-timer');
const blackTimerDisplay = document.getElementById('black-timer');

// Home Page DOM Elements
const startGameButton = document.getElementById('start-game-button');
const selectWhiteRadio = document.getElementById('select-white');
const selectBlackRadio = document.getElementById('select-black');
const modeTimerRadio = document.getElementById('mode-timer');
const modeNormalRadio = document.getElementById('mode-normal');
const backToHomeButton = document.getElementById('back-to-home-button');


// --- Helper Functions ---

/**
 * Converts a square ID (e.g., 'a1') to [row, col] array.
 * @param {string} squareId - The ID of the square.
 * @returns {number[]} - [row, col] array.
 */
function squareIdToCoords(squareId) {
    const col = squareId.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(squareId[1]);
    return [row, col];
}

/**
 * Converts [row, col] array to a square ID (e.g., 'a1').
 * @param {number} row - The row index (0-7).
 * @param {number} col - The column index (0-7).
 * @returns {string} - The square ID.
 */
function coordsToSquareId(row, col) {
    const file = String.fromCharCode('a'.charCodeAt(0) + col);
    const rank = 8 - row;
    return `${file}${rank}`;
}

/**
 * Checks if coordinates are within board bounds.
 * @param {number} r - Row index.
 * @param {number} c - Column index.
 * @returns {boolean} - True if within bounds, false otherwise.
 */
function isValidCoord(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}

/**
 * Gets the piece at a given coordinate.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @returns {string} - The piece character or empty string.
 */
function getPieceAt(row, col) {
    if (!isValidCoord(row, col)) {
        return ''; // Out of bounds
    }
    return board[row][col];
}

/**
 * Sets the piece at a given coordinate.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @param {string} piece - The piece character or empty string.
 */
function setPieceAt(row, col, piece) {
    if (isValidCoord(row, col)) {
        board[row][col] = piece;
    }
}

/**
 * Determines the color of a piece.
 * @param {string} piece - The piece character.
 * @returns {string} - 'white', 'black', or 'none'.
 */
function getPieceColor(piece) {
    if (!piece) return 'none';
    return piece === piece.toLowerCase() ? 'white' : 'black';
}

/**
 * Gets the opponent's color.
 * @param {string} color - 'white' or 'black'.
 * @returns {string} - The opponent's color.
 */
function getOpponentColor(color) {
    return color === 'white' ? 'black' : 'white';
}

/**
 * Simulates a move on a temporary board to check for king safety.
 * @param {Array<Array<string>>} tempBoard - The board to simulate on.
 * @param {number} fromRow - Start row.
 * @param {number} fromCol - Start col.
 * @param {number} toRow - Target row.
 * @param {number} toCol - Target col.
 * @returns {Array<Array<string>>} - The board after simulation.
 */
function simulateMove(tempBoard, fromRow, fromCol, toRow, toCol) {
    const newBoard = JSON.parse(JSON.stringify(tempBoard)); // Deep copy
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = '';
    return newBoard;
}

/**
 * Finds the king's position for a given color.
 * @param {string} color - 'white' or 'black'.
 * @param {Array<Array<string>>} currentBoard - The board state to check against.
 * @returns {number[]} - [row, col] of the king.
 */
function findKingPosition(color, currentBoard) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = currentBoard[r][c];
            if (getPieceColor(piece) === color && (piece.toLowerCase() === 'k')) {
                return [r, c];
            }
        }
    }
    return [-1, -1]; // Should not happen in a valid game
}

/**
 * Checks if a square is attacked by a specific color.
 * @param {number} targetRow - The row of the square to check.
 * @param {number} targetCol - The column of the square to check.
 * @param {string} attackerColor - The color of the attacking pieces ('white' or 'black').
 * @param {Array<Array<string>>} currentBoard - The board state to check against.
 * @returns {boolean} - True if the square is attacked, false otherwise.
 */
function isSquareAttacked(targetRow, targetCol, attackerColor, currentBoard) {
    const opponentColor = attackerColor;
    const ownColor = getOpponentColor(opponentColor); // The color whose king is being checked

    // Directions for sliding pieces (Rook, Bishop, Queen)
    const directions = [
        { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }, // Rook/Queen
        { dr: -1, dc: -1 }, { dr: 1, dc: 1 }, { dr: 1, dc: -1 }, { dr: -1, dc: 1 }  // Bishop/Queen
    ];

    // Check for Rooks, Bishops, Queens
    for (const dir of directions) {
        for (let i = 1; i < 8; i++) {
            const r = targetRow + dir.dr * i;
            const c = targetCol + dir.dc * i;

            if (!isValidCoord(r, c)) break;

            const piece = currentBoard[r][c];
            if (!piece) continue; // Empty square, continue in this direction

            const pieceColor = getPieceColor(piece);
            if (pieceColor === ownColor) break; // Own piece blocks, stop in this direction

            if (pieceColor === opponentColor) {
                const pieceType = piece.toLowerCase();
                if (
                    (pieceType === 'r' && (dir.dr === 0 || dir.dc === 0)) || // Rook
                    (pieceType === 'b' && (dir.dr !== 0 && dir.dc !== 0)) || // Bishop
                    (pieceType === 'q') // Queen
                ) {
                    return true;
                }
                break; // Opponent piece, but not attacking in this direction, stop
            }
        }
    }

    // Check for Knights
    const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightMoves) {
        const r = targetRow + dr;
        const c = targetCol + dc;
        if (isValidCoord(r, c)) {
            const piece = currentBoard[r][c];
            if (getPieceColor(piece) === opponentColor && piece.toLowerCase() === 'n') {
                return true;
            }
        }
    }

    // Check for Pawns
    const pawnAttackDirs = opponentColor === 'white' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
    for (const [dr, dc] of pawnAttackDirs) {
        const r = targetRow + dr;
        const c = targetCol + dc;
        if (isValidCoord(r, c)) {
            const piece = currentBoard[r][c];
            if (getPieceColor(piece) === opponentColor && piece.toLowerCase() === 'p') {
                return true;
            }
        }
    }

    // Check for King (to prevent king moving into attacked square)
    const kingMoves = [
        [-1, -1], [-1, 0], [-1, 1], [0, -1],
        [0, 1], [1, -1], [1, 0], [1, 1]
    ];
    for (const [dr, dc] of kingMoves) {
        const r = targetRow + dr;
        const c = targetCol + dc;
        if (isValidCoord(r, c)) {
            const piece = currentBoard[r][c];
            if (getPieceColor(piece) === opponentColor && piece.toLowerCase() === 'k') {
                // This check is for if a king moves next to another king, which is illegal.
                // It's not for detecting if a king is in check by another king.
                return true;
            }
        }
    }

    return false;
}

/**
 * Checks if the king of a given color is currently in check.
 * @param {string} color - The color of the king to check ('white' or 'black').
 * @param {Array<Array<string>>} currentBoard - The board state to check against.
 * @returns {boolean} - True if the king is in check, false otherwise.
 */
function isKingInCheck(color, currentBoard) {
    const [kingR, kingC] = findKingPosition(color, currentBoard);
    if (kingR === -1) return false; // King not found (shouldn't happen)
    const opponentColor = getOpponentColor(color);
    return isSquareAttacked(kingR, kingC, opponentColor, currentBoard);
}

/**
 * Generates all pseudo-legal moves for a piece at (row, col).
 * These moves don't consider if the king would be in check.
 * @param {number} row - Piece row.
 * @param {number} col - Piece col.
 * @param {Array<Array<string>>} currentBoard - The board state to check against.
 * @returns {string[]} - Array of square IDs of pseudo-legal moves.
 */
function getPseudoLegalMoves(row, col, currentBoard) {
    const piece = currentBoard[row][col];
    const pieceType = piece.toLowerCase();
    const pieceColor = getPieceColor(piece);
    let moves = [];

    switch (pieceType) {
        case 'p': // Pawn
            const direction = pieceColor === 'white' ? -1 : 1; // White moves up (row -1), Black moves down (row +1)
            const startRow = pieceColor === 'white' ? 6 : 1;

            // Forward 1
            if (isValidCoord(row + direction, col) && !currentBoard[row + direction][col]) {
                moves.push(coordsToSquareId(row + direction, col));
                // Forward 2 (initial move)
                if (row === startRow && !currentBoard[row + 2 * direction][col]) {
                    moves.push(coordsToSquareId(row + 2 * direction, col));
                }
            }

            // Captures
            const captureCols = [col - 1, col + 1];
            for (const c of captureCols) {
                if (isValidCoord(row + direction, c)) {
                    const targetPiece = currentBoard[row + direction][c];
                    if (targetPiece && getPieceColor(targetPiece) === getOpponentColor(pieceColor)) {
                        moves.push(coordsToSquareId(row + direction, c));
                    }
                }
            }

            // En Passant
            if (enPassantTargetSquare) {
                const [epRow, epCol] = squareIdToCoords(enPassantTargetSquare);
                if (row + direction === epRow && (col - 1 === epCol || col + 1 === epCol)) {
                    // Check if the pawn is actually adjacent to the en passant target
                    // The captured pawn would be on the same column as epCol, but on the row of the current pawn
                    // This check ensures it's a valid en passant scenario where a pawn moved 2 squares
                    const pawnToCaptureRow = epRow - direction; // The row where the captured pawn is
                    if (row === (pieceColor === 'white' ? 3 : 4) && // Pawn must be on 4th/5th rank
                        epRow === (pieceColor === 'white' ? 2 : 5) && // Target square must be 3rd/6th rank
                        currentBoard[pawnToCaptureRow][epCol] &&
                        getPieceColor(currentBoard[pawnToCaptureRow][epCol]) === getOpponentColor(pieceColor) &&
                        currentBoard[pawnToCaptureRow][epCol].toLowerCase() === 'p') {
                        moves.push(enPassantTargetSquare);
                    }
                }
            }
            break;

        case 'r': // Rook
            const rookDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right
            for (const [dr, dc] of rookDirections) {
                for (let i = 1; i < 8; i++) {
                    const r = row + dr * i;
                    const c = col + dc * i;
                    if (!isValidCoord(r, c)) break;
                    const targetPiece = currentBoard[r][c];
                    if (!targetPiece) {
                        moves.push(coordsToSquareId(r, c));
                    } else {
                        if (getPieceColor(targetPiece) === getOpponentColor(pieceColor)) {
                            moves.push(coordsToSquareId(r, c)); // Capture
                        }
                        break; // Blocked by own or opponent piece
                    }
                }
            }
            break;

        case 'n': // Knight
            const knightMoves = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            for (const [dr, dc] of knightMoves) {
                const r = row + dr;
                const c = col + dc;
                if (isValidCoord(r, c)) {
                    const targetPiece = currentBoard[r][c];
                    if (!targetPiece || getPieceColor(targetPiece) === getOpponentColor(pieceColor)) {
                        moves.push(coordsToSquareId(r, c));
                    }
                }
            }
            break;

        case 'b': // Bishop
            const bishopDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // Diagonals
            for (const [dr, dc] of bishopDirections) {
                for (let i = 1; i < 8; i++) {
                    const r = row + dr * i;
                    const c = col + dc * i;
                    if (!isValidCoord(r, c)) break;
                    const targetPiece = currentBoard[r][c];
                    if (!targetPiece) {
                        moves.push(coordsToSquareId(r, c));
                    } else {
                        if (getPieceColor(targetPiece) === getOpponentColor(pieceColor)) {
                            moves.push(coordsToSquareId(r, c)); // Capture
                        }
                        break; // Blocked
                    }
                }
            }
            break;

        case 'q': // Queen
            const queenDirections = [
                [-1, 0], [1, 0], [0, -1], [0, 1], // Rook moves
                [-1, -1], [-1, 1], [1, -1], [1, 1]  // Bishop moves
            ];
            for (const [dr, dc] of queenDirections) {
                for (let i = 1; i < 8; i++) {
                    const r = row + dr * i;
                    const c = col + dc * i;
                    if (!isValidCoord(r, c)) break;
                    const targetPiece = currentBoard[r][c];
                    if (!targetPiece) {
                        moves.push(coordsToSquareId(r, c));
                    } else {
                        if (getPieceColor(targetPiece) === getOpponentColor(pieceColor)) {
                            moves.push(coordsToSquareId(r, c)); // Capture
                        }
                        break; // Blocked
                    }
                }
            }
            break;

        case 'k': // King
            const kingMoves = [
                [-1, -1], [-1, 0], [-1, 1], [0, -1],
                [0, 1], [1, -1], [1, 0], [1, 1]
            ];
            for (const [dr, dc] of kingMoves) {
                const r = row + dr;
                const c = col + dc;
                if (isValidCoord(r, c)) {
                    const targetPiece = currentBoard[r][c];
                    if (!targetPiece || getPieceColor(targetPiece) === getOpponentColor(pieceColor)) {
                        moves.push(coordsToSquareId(r, c));
                    }
                }
            }

            // Castling
            if (pieceColor === 'white' && row === 7 && col === 4) { // White King's initial square
                if (canWhiteCastleKingside) {
                    // Kingside: squares f1 and g1 must be empty, not attacked
                    if (!currentBoard[7][5] && !currentBoard[7][6] &&
                        currentBoard[7][7] === 'r' && // Rook
                        !isKingInCheck('white', currentBoard) && // King not in check
                        !isSquareAttacked(7, 5, 'black', currentBoard) && // Squares passed not attacked
                        !isSquareAttacked(7, 6, 'black', currentBoard)) {
                        moves.push(coordsToSquareId(7, 6)); // g1
                    }
                }
                if (canWhiteCastleQueenside) {
                    // Queenside: squares b1, c1, d1 must be empty, not attacked
                    if (!currentBoard[7][1] && !currentBoard[7][2] && !currentBoard[7][3] &&
                        currentBoard[7][0] === 'r' && // Rook
                        !isKingInCheck('white', currentBoard) && // King not in check
                        !isSquareAttacked(7, 3, 'black', currentBoard) && // Squares passed not attacked
                        !isSquareAttacked(7, 2, 'black', currentBoard)) {
                        moves.push(coordsToSquareId(7, 2)); // c1
                    }
                }
            } else if (pieceColor === 'black' && row === 0 && col === 4) { // Black King's initial square
                if (canBlackCastleKingside) {
                    // Kingside: squares f8 and g8 must be empty, not attacked
                    if (!currentBoard[0][5] && !currentBoard[0][6] &&
                        currentBoard[0][7] === 'R' && // Rook
                        !isKingInCheck('black', currentBoard) && // King not in check
                        !isSquareAttacked(0, 5, 'white', currentBoard) && // Squares passed not attacked
                        !isSquareAttacked(0, 6, 'white', currentBoard)) {
                        moves.push(coordsToSquareId(0, 6)); // g8
                    }
                }
                if (canBlackCastleQueenside) {
                    // Queenside: squares b8, c8, d8 must be empty, not attacked
                    if (!currentBoard[0][1] && !currentBoard[0][2] && !currentBoard[0][3] &&
                        currentBoard[0][0] === 'R' && // Rook
                        !isKingInCheck('black', currentBoard) && // King not in check
                        !isSquareAttacked(0, 3, 'white', currentBoard) && // Squares passed not attacked
                        !isSquareAttacked(0, 2, 'white', currentBoard)) {
                        moves.push(coordsToSquareId(0, 2)); // c1
                    }
                }
            }
            break;
    }
    return moves;
}

/**
 * Gets all truly legal moves for a piece at (row, col),
 * filtering out moves that would leave the king in check.
 * @param {number} row - Piece row.
 * @param {number} col - Piece col.
 * @returns {string[]} - Array of square IDs of legal moves.
 */
function getLegalMoves(row, col) {
    const piece = getPieceAt(row, col);
    if (!piece || getPieceColor(piece) !== turn) {
        return []; // Not a piece of the current turn
    }

    const pseudoLegalMoves = getPseudoLegalMoves(row, col, board);
    const validMoves = [];

    for (const moveId of pseudoLegalMoves) {
        const [toRow, toCol] = squareIdToCoords(moveId);

        // Simulate the move
        const simulatedBoard = simulateMove(board, row, col, toRow, toCol);

        // Handle En Passant capture in simulation
        if (piece.toLowerCase() === 'p' && moveId === enPassantTargetSquare) {
            const pawnDirection = getPieceColor(piece) === 'white' ? -1 : 1;
            const capturedPawnRow = toRow - pawnDirection;
            const capturedPawnCol = toCol;
            simulatedBoard[capturedPawnRow][capturedPawnCol] = ''; // Remove captured pawn
        }

        // Check if king is in check after the simulated move
        if (!isKingInCheck(turn, simulatedBoard)) {
            validMoves.push(moveId);
        }
    }
    return validMoves;
}

/**
 * Generates a simplified FEN string for the current board position.
 * This is used for threefold repetition. It does not include turn, castling rights, en passant, etc.
 * @returns {string} - Simplified FEN string.
 */
function generateBoardFen() {
    let fen = '';
    for (let r = 0; r < 8; r++) {
        let emptyCount = 0;
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece === '') {
                emptyCount++;
            } else {
                if (emptyCount > 0) {
                    fen += emptyCount;
                    emptyCount = 0;
                }
                fen += piece;
            }
        }
        if (emptyCount > 0) {
            fen += emptyCount;
        }
        if (r < 7) {
            fen += '/';
        }
    }
    return fen;
}

/**
 * Checks for draw by insufficient material.
 * @returns {boolean} - True if draw by insufficient material, false otherwise.
 */
function isInsufficientMaterial() {
    const pieces = {
        'white': { 'k': 0, 'b': 0, 'n': 0, 'p': 0, 'r': 0, 'q': 0 },
        'black': { 'k': 0, 'b': 0, 'n': 0, 'p': 0, 'r': 0, 'q': 0 }
    };

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                const color = getPieceColor(piece);
                pieces[color][piece.toLowerCase()]++;
            }
        }
    }

    // King vs King
    if (pieces.white.k === 1 && pieces.black.k === 1 &&
        Object.values(pieces.white).filter((v, i) => i !== 0).every(count => count === 0) && // Only king for white
        Object.values(pieces.black).filter((v, i) => i !== 0).every(count => count === 0)) { // Only king for black
        return true;
    }

    // King and Bishop vs King
    if (pieces.white.k === 1 && pieces.black.k === 1 &&
        ((pieces.white.b === 1 && Object.values(pieces.white).filter((v, i) => i !== 0 && i !== 2).every(count => count === 0)) && Object.values(pieces.black).filter((v, i) => i !== 0).every(count => count === 0)) ||
        ((pieces.black.b === 1 && Object.values(pieces.black).filter((v, i) => i !== 0 && i !== 2).every(count => count === 0)) && Object.values(pieces.white).filter((v, i) => i !== 0).every(count => count === 0))) {
        return true;
    }

    // King and Knight vs King
    if (pieces.white.k === 1 && pieces.black.k === 1 &&
        ((pieces.white.n === 1 && Object.values(pieces.white).filter((v, i) => i !== 0 && i !== 1).every(count => count === 0)) && Object.values(pieces.black).filter((v, i) => i !== 0).every(count => count === 0)) ||
        ((pieces.black.n === 1 && Object.values(pieces.black).filter((v, i) => i !== 0 && i !== 1).every(count => count === 0)) && Object.values(pieces.white).filter((v, i) => i !== 0).every(count => count === 0))) {
        return true;
    }
    // More complex insufficient material (e.g., K+B vs K+B on same color squares) are not implemented for simplicity.
    return false;
}

/**
 * Checks for draw by threefold repetition.
 * @returns {boolean} - True if draw by threefold repetition, false otherwise.
 */
function isThreefoldRepetition() {
    const currentFen = generateBoardFen();
    let count = 0;
    for (const fen of boardHistory) {
        if (fen === currentFen) {
            count++;
        }
    }
    return count >= 3;
}

/**
 * Checks for draw by 50-move rule.
 * @returns {boolean} - True if draw by 50-move rule, false otherwise.
 */
function isFiftyMoveRule() {
    return halfmoveClock >= 100; // 50 full moves = 100 half moves
}

/**
 * Checks if the current player has any legal moves.
 * Used for checkmate and stalemate detection.
 * @param {string} color - The color of the player to check.
 * @returns {boolean} - True if no legal moves, false otherwise.
 */
function isCheckmateOrStalemate(color) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = getPieceAt(r, c);
            if (getPieceColor(piece) === color) {
                const moves = getLegalMoves(r, c);
                if (moves.length > 0) {
                    return false; // Found at least one legal move
                }
            }
        }
    }
    return true; // No legal moves found for the current player
}

/**
 * Checks all game end conditions (checkmate, stalemate, draws, timeout).
 * @returns {boolean} - True if the game has ended, false otherwise.
 */
function checkGameEndConditions() {
    const currentKingInCheck = isKingInCheck(turn, board);
    const noLegalMoves = isCheckmateOrStalemate(turn);

    if (noLegalMoves) {
        stopTimer(); // Stop timer if game ends
        gameActive = false;
        if (currentKingInCheck) {
            statusMessageElement.textContent = `Game Over! ${turn.charAt(0).toUpperCase() + turn.slice(1)} is in Checkmate!`;
        } else {
            statusMessageElement.textContent = `Game Over! Stalemate!`;
        }
        disableBoardInteraction();
        updateUndoRedoButtons(); // Disable undo/redo on game over
        return true;
    }

    if (isFiftyMoveRule()) {
        stopTimer(); // Stop timer if game ends
        gameActive = false;
        statusMessageElement.textContent = `Game Over! Draw by 50-move rule!`;
        disableBoardInteraction();
        updateUndoRedoButtons(); // Disable undo/redo on game over
        return true;
    }

    if (isThreefoldRepetition()) {
        stopTimer(); // Stop timer if game ends
        gameActive = false;
        statusMessageElement.textContent = `Game Over! Draw by threefold repetition!`;
        disableBoardInteraction();
        updateUndoRedoButtons(); // Disable undo/redo on game over
        return true;
    }

    if (isInsufficientMaterial()) {
        stopTimer(); // Stop timer if game ends
        gameActive = false;
        statusMessageElement.textContent = `Game Over! Draw by insufficient material!`;
        disableBoardInteraction();
        updateUndoRedoButtons(); // Disable undo/redo on game over
        return true;
    }

    // Check for timeout ONLY if in timer mode
    if (currentGameMode === 'timer') {
        if (whiteTime <= 0) {
            stopTimer();
            gameActive = false;
            statusMessageElement.textContent = `Time's up for White! Black wins by timeout!`;
            disableBoardInteraction();
            updateUndoRedoButtons();
            return true;
        }
        if (blackTime <= 0) {
            stopTimer();
            gameActive = false;
            statusMessageElement.textContent = `Time's up for Black! White wins by timeout!`;
            disableBoardInteraction();
            updateUndoRedoButtons();
            return true;
        }
    }

    return false;
}

/**
 * Saves the current game state into the gameStates history.
 * This should be called AFTER a move has been fully processed and the board state updated.
 */
function saveGameState() {
    // If we've undone moves and then make a new move,
    // all "future" states are invalidated.
    if (currentStateIndex < gameStates.length - 1) {
        gameStates.splice(currentStateIndex + 1);
    }

    const state = {
        board: JSON.parse(JSON.stringify(board)), // Deep copy of board
        turn: turn,
        moveNumber: moveNumber,
        whiteKingPos: JSON.parse(JSON.stringify(whiteKingPos)),
        blackKingPos: JSON.parse(JSON.stringify(blackKingPos)),
        canWhiteCastleKingside: canWhiteCastleKingside,
        canWhiteCastleQueenside: canWhiteCastleQueenside,
        canBlackCastleKingside: canBlackCastleKingside,
        canBlackCastleQueenside: canBlackCastleQueenside,
        enPassantTargetSquare: enPassantTargetSquare,
        halfmoveClock: halfmoveClock,
        boardHistory: JSON.parse(JSON.stringify(boardHistory)), // Deep copy for repetition
        moveHistory: JSON.parse(JSON.stringify(moveHistory)), // Deep copy of simplified move history for UI rebuild
        whiteTime: whiteTime, // Save current timer values
        blackTime: blackTime,
        gameActive: gameActive, // Save game active status
        currentGameMode: currentGameMode, // Save current game mode
        currentPlayerColor: currentPlayerColor // Save selected player color
    };
    gameStates.push(state);
    currentStateIndex = gameStates.length - 1;
    updateUndoRedoButtons();
}

/**
 * Loads a specific game state from the gameStates history.
 * @param {number} index - The index of the state to load.
 */
function loadGameState(index) {
    if (index < 0 || index >= gameStates.length) {
        console.error("Invalid state index to load.");
        return;
    }

    const state = gameStates[index];

    board = JSON.parse(JSON.stringify(state.board));
    turn = state.turn;
    moveNumber = state.moveNumber;
    whiteKingPos = JSON.parse(JSON.stringify(state.whiteKingPos));
    blackKingPos = JSON.parse(JSON.stringify(state.blackKingPos));
    canWhiteCastleKingside = state.canWhiteCastleKingside;
    canWhiteCastleQueenside = state.canWhiteCastleQueenside;
    canBlackCastleKingside = state.canBlackCastleKingside;
    canBlackCastleQueenside = state.canBlackCastleQueenside;
    enPassantTargetSquare = state.enPassantTargetSquare;
    halfmoveClock = state.halfmoveClock;
    boardHistory = JSON.parse(JSON.stringify(state.boardHistory));
    moveHistory = JSON.parse(JSON.stringify(state.moveHistory));
    whiteTime = state.whiteTime; // Load timer values
    blackTime = state.blackTime;
    gameActive = state.gameActive; // Load game active status
    currentGameMode = state.currentGameMode; // Load game mode
    currentPlayerColor = state.currentPlayerColor; // Load player color

    renderBoard(); // Re-render the board to reflect the loaded state
    updateMovesListUI(); // Rebuild the moves list UI
    updateUndoRedoButtons(); // Update button states
    updateTimerDisplay(); // Update timer display

    // Re-enable interaction if it was disabled by game over
    document.querySelectorAll('.square').forEach(sq => {
        sq.addEventListener('click', handleSquareClick);
        sq.style.cursor = 'pointer';
    });

    // Stop current timer and start for the correct player if game is active AND in timer mode
    stopTimer();
    if (gameActive && currentGameMode === 'timer') {
        startTimer();
    } else {
        // If the loaded state was game over, disable board interaction
        disableBoardInteraction();
    }
}

/**
 * Updates the state of the Undo and Redo buttons (disabled/enabled).
 */
function updateUndoRedoButtons() {
    undoButton.disabled = currentStateIndex <= 0 || !gameActive; // Cannot undo from initial state or if game ended
    redoButton.disabled = currentStateIndex >= gameStates.length - 1 || !gameActive; // Cannot redo if at latest state or if game ended
}

/**
 * Formats seconds into MM:SS format and updates the timer displays.
 */
function updateTimerDisplay() {
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    whiteTimerDisplay.textContent = formatTime(whiteTime);
    blackTimerDisplay.textContent = formatTime(blackTime);

    const whitePlayerInfo = document.querySelector('.player-white');
    const blackPlayerInfo = document.querySelector('.player-black');

    whitePlayerInfo.classList.remove('active-turn');
    blackPlayerInfo.classList.remove('active-turn');

    // Add/remove inactive class for timers based on game mode
    if (currentGameMode === 'normal') {
        whiteTimerDisplay.classList.add('timer-inactive');
        blackTimerDisplay.classList.add('timer-inactive');
    } else {
        whiteTimerDisplay.classList.remove('timer-inactive');
        blackTimerDisplay.classList.remove('timer-inactive');
    }
    
    if (gameActive && currentGameMode === 'timer') {
        if (turn === 'white') {
            whitePlayerInfo.classList.add('active-turn');
        } else {
            blackPlayerInfo.classList.add('active-turn');
        }
    }
    // In normal mode, no highlight, and timers simply display the time without counting down.
}

/**
 * Starts the timer for the current player.
 */
function startTimer() {
    stopTimer(); // Ensure any existing timer is stopped
    if (!gameActive || currentGameMode !== 'timer') return; // Only start if game is active and in timer mode

    timerInterval = setInterval(() => {
        if (turn === 'white') {
            whiteTime--;
            if (whiteTime <= 0) {
                whiteTime = 0; // Ensure time doesn't go negative on display
                checkGameEndConditions(); // Check for timeout
            }
        } else {
            blackTime--;
            if (blackTime <= 0) {
                blackTime = 0; // Ensure time doesn't go negative on display
                checkGameEndConditions(); // Check for timeout
            }
        }
        updateTimerDisplay();
    }, 1000); // Update every second
}

/**
 * Stops the currently running timer.
 */
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

/**
 * Controls which page (home or game) is displayed.
 * @param {string} pageName - 'home' or 'game'.
 */
function displayPage(pageName) {
    if (pageName === 'home') {
        homePage.classList.add('active-page');
        gamePage.classList.remove('active-page');
        stopTimer(); // Stop timer if navigating away from game
        gameActive = false; // Game is not active on home page
    } else if (pageName === 'game') {
        homePage.classList.remove('active-page');
        gamePage.classList.add('active-page');
    }
}


// --- Core Game Functions ---

/**
 * Initializes the board with the starting chess pieces.
 */
function initializeBoard() {
    board = JSON.parse(JSON.stringify(initialBoardFen)); // Deep copy
    moveHistory = [];
    turn = 'white'; // Game logic always starts with White
    moveNumber = 1;
    selectedSquareId = null;
    legalMoves = [];
    whiteKingPos = [7, 4];
    blackKingPos = [0, 4];
    canWhiteCastleKingside = true;
    canWhiteCastleQueenside = true;
    canBlackCastleKingside = true;
    canBlackCastleQueenside = true;
    enPassantTargetSquare = null;
    halfmoveClock = 0;
    boardHistory = []; // Clear history for new game

    gameStates = []; // Clear game states for new game
    currentStateIndex = -1; // Reset index

    // Reset timers for new game based on selected mode
    whiteTime = 5 * 60; // 5 minutes
    blackTime = 5 * 60;
    gameActive = true; // Set game to active

    statusMessageElement.textContent = 'White to move';
    updateMovesListUI(); // Clear moves list UI
    updateTimerDisplay(); // Update timer display with initial times

    stopTimer(); // Ensure no timer running before starting the correct one
    if (currentGameMode === 'timer') {
        startTimer(); // Start timer only if in timer mode
    } else {
        // In normal mode, ensure active turn highlight is correctly updated (removes highlight)
        document.querySelector('.player-white').classList.remove('active-turn');
        document.querySelector('.player-black').classList.remove('active-turn');
    }

    renderBoard(); // Render the board first
    saveGameState(); // Save the initial board state
    
    // Re-enable board interaction if it was disabled
    document.querySelectorAll('.square').forEach(sq => {
        sq.addEventListener('click', handleSquareClick);
        sq.style.cursor = 'pointer';
    });
    updateUndoRedoButtons();
    
    // Note: If playing against AI, the 'currentPlayerColor' would determine if AI makes the first move.
    // For now, game always starts as White's turn, and the user directly controls that turn.
    // This 'currentPlayerColor' mostly serves as a user preference for display or future AI interaction.
    console.log(`Game started: Player as ${currentPlayerColor}, Mode: ${currentGameMode}`);
}

/**
 * Renders the chessboard based on the current 'board' state.
 * Creates square elements and places pieces.
 */
function renderBoard() {
    chessboardElement.innerHTML = ''; // Clear existing board
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const squareId = coordsToSquareId(row, col);
            const squareElement = document.createElement('div');
            squareElement.id = squareId;
            squareElement.classList.add('square');
            squareElement.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');

            const pieceChar = getPieceAt(row, col);
            if (pieceChar) {
                const pieceElement = document.createElement('span');
                pieceElement.classList.add('piece');
                // Add color class based on piece color
                const pieceColor = getPieceColor(pieceChar);
                if (pieceColor === 'white') {
                    pieceElement.classList.add('color-white');
                } else if (pieceColor === 'black') {
                    pieceElement.classList.add('color-black');
                }
                pieceElement.textContent = PIECES[pieceChar];
                squareElement.appendChild(pieceElement);
            }

            // Add click event listener to each square
            squareElement.addEventListener('click', handleSquareClick);
            chessboardElement.appendChild(squareElement);
        }
    }
    updateBoardHighlights();

    // Check game end conditions after rendering
    if (!checkGameEndConditions()) { // If game is not over by other conditions
        // If game is not over, update turn message
        if (isKingInCheck(turn, board)) {
            statusMessageElement.textContent = `${turn.charAt(0).toUpperCase() + turn.slice(1)} is in check!`;
        } else {
            statusMessageElement.textContent = `${turn.charAt(0).toUpperCase() + turn.slice(1)} to move`;
        }
    }
}

/**
 * Disables interaction with the board (e.g., after game over).
 */
function disableBoardInteraction() {
    document.querySelectorAll('.square').forEach(sq => {
        sq.removeEventListener('click', handleSquareClick);
        sq.style.cursor = 'default';
    });
    stopTimer(); // Stop timer when interaction is disabled
    gameActive = false; // Mark game as inactive
    updateTimerDisplay(); // Remove active highlight from timers
}

/**
 * Updates visual highlights for selected piece and legal moves.
 */
function updateBoardHighlights() {
    // Remove all existing highlights
    document.querySelectorAll('.square').forEach(sq => {
        sq.classList.remove('selected', 'highlight-move');
    });

    // Add highlight for selected square
    if (selectedSquareId) {
        document.getElementById(selectedSquareId).classList.add('selected');
    }

    // Add highlights for legal moves
    legalMoves.forEach(moveId => {
        document.getElementById(moveId).classList.add('highlight-move');
    });
}

/**
 * Handles a click event on a chessboard square.
 * Implements basic select/move logic.
 * @param {Event} event - The click event.
 */
function handleSquareClick(event) {
    const clickedSquareId = event.currentTarget.id;
    const [clickedRow, clickedCol] = squareIdToCoords(clickedSquareId);
    const clickedPiece = getPieceAt(clickedRow, clickedCol);
    const clickedPieceColor = getPieceColor(clickedPiece);

    // Scenario 1: No piece currently selected
    if (selectedSquareId === null) {
        // If clicked an empty square or opponent's piece, do nothing
        if (!clickedPiece || clickedPieceColor !== turn) {
            return;
        }
        // If clicked a piece of the current turn's color, select it
        selectedSquareId = clickedSquareId;
        legalMoves = getLegalMoves(clickedRow, clickedCol); // Get actual legal moves
        updateBoardHighlights();
    }
    // Scenario 2: A piece is already selected
    else {
        const [selectedRow, selectedCol] = squareIdToCoords(selectedSquareId);
        const selectedPiece = getPieceAt(selectedRow, selectedCol);
        const selectedPieceColor = getPieceColor(selectedPiece);

        // If clicked the same piece again, deselect it
        if (clickedSquareId === selectedSquareId) {
            selectedSquareId = null;
            legalMoves = [];
            updateBoardHighlights();
            return;
        }

        // If clicked on one of the highlighted legal moves
        if (legalMoves.includes(clickedSquareId)) {
            // Perform the move
            performMove(selectedSquareId, clickedSquareId);
        }
        // If clicked on another piece of the *same* color, select the new piece
        else if (clickedPiece && clickedPieceColor === selectedPieceColor) {
            selectedSquareId = clickedSquareId;
            legalMoves = getLegalMoves(clickedRow, clickedCol);
            updateBoardHighlights();
        }
        // If clicked on an invalid square (not a legal move, not own piece), deselect the current piece
        else {
            selectedSquareId = null;
            legalMoves = [];
            updateBoardHighlights();
        }
    }
}

/**
 * Executes a move on the board state and updates UI.
 * @param {string} fromId - The ID of the starting square.
 * @param {string} toId - The ID of the destination square.
 */
function performMove(fromId, toId) {
    const [fromRow, fromCol] = squareIdToCoords(fromId);
    const [toRow, toCol] = squareIdToCoords(toId);

    const pieceMoved = getPieceAt(fromRow, fromCol);
    let capturedPiece = getPieceAt(toRow, toCol); // Check if a piece is being captured

    // Reset halfmove clock if pawn move or capture
    const isPawnMove = pieceMoved.toLowerCase() === 'p';
    const isCapture = !!capturedPiece || (isPawnMove && toId === enPassantTargetSquare);

    if (isPawnMove || isCapture) {
        halfmoveClock = 0;
    } else {
        halfmoveClock++;
    }

    // --- Handle Castling ---
    if (pieceMoved.toLowerCase() === 'k' && Math.abs(fromCol - toCol) === 2) {
        // King moved two squares horizontally, it's a castle
        if (toCol === 6) { // Kingside castle
            const rookPiece = getPieceAt(fromRow, 7);
            setPieceAt(fromRow, 5, rookPiece); // Move rook to f1/f8
            setPieceAt(fromRow, 7, ''); // Clear old rook square
        } else if (toCol === 2) { // Queenside castle
            const rookPiece = getPieceAt(fromRow, 0);
            setPieceAt(fromRow, 3, rookPiece); // Move rook to d1/d8
            setPieceAt(fromRow, 0, ''); // Clear old rook square
        }
    }

    // --- Handle En Passant Capture ---
    if (pieceMoved.toLowerCase() === 'p' && toId === enPassantTargetSquare && !capturedPiece) {
        const pawnDirection = getPieceColor(pieceMoved) === 'white' ? -1 : 1;
        const capturedPawnRow = toRow - pawnDirection;
        const capturedPawnCol = toCol;
        capturedPiece = getPieceAt(capturedPawnRow, capturedPawnCol); // Get the actual captured pawn
        setPieceAt(capturedPawnRow, capturedPawnCol, ''); // Remove the captured pawn
    }

    // Update board state
    setPieceAt(toRow, toCol, pieceMoved);
    setPieceAt(fromRow, fromCol, ''); // Clear the original square

    // Update king positions
    if (pieceMoved.toLowerCase() === 'k') {
        if (getPieceColor(pieceMoved) === 'white') {
            whiteKingPos = [toRow, toCol];
        } else {
            blackKingPos = [toRow, toCol];
        }
    }

    // Update castling rights
    if (pieceMoved.toLowerCase() === 'k') {
        if (getPieceColor(pieceMoved) === 'white') {
            canWhiteCastleKingside = false;
            canWhiteCastleQueenside = false;
        } else {
            canBlackCastleKingside = false;
            canBlackCastleQueenside = false;
        }
    } else if (pieceMoved.toLowerCase() === 'r') {
        if (getPieceColor(pieceMoved) === 'white') {
            if (fromRow === 7 && fromCol === 0) canWhiteCastleQueenside = false;
            if (fromRow === 7 && fromCol === 7) canWhiteCastleKingside = false;
        } else {
            if (fromRow === 0 && fromCol === 0) canBlackCastleQueenside = false;
            if (fromRow === 0 && fromCol === 7) canBlackCastleKingside = false;
        }
    }

    // Set en passant target square for next turn
    enPassantTargetSquare = null;
    if (pieceMoved.toLowerCase() === 'p' && Math.abs(fromRow - toRow) === 2) {
        const targetRow = fromRow + (getPieceColor(pieceMoved) === 'white' ? -1 : 1);
        enPassantTargetSquare = coordsToSquareId(targetRow, fromCol);
    }

    // --- Handle Pawn Promotion (simplified: always promotes to Queen) ---
    if (pieceMoved.toLowerCase() === 'p') {
        if ((getPieceColor(pieceMoved) === 'white' && toRow === 0) ||
            (getPieceColor(pieceMoved) === 'black' && toRow === 7)) {
            const promotedPiece = getPieceColor(pieceMoved) === 'white' ? 'q' : 'Q';
            setPieceAt(toRow, toCol, promotedPiece);
        }
    }

    // Add move to history (for internal tracking and UI rebuild)
    addMoveToHistory(fromId, toId, pieceMoved, capturedPiece);

    // Stop current player's timer
    stopTimer();

    // Switch turn
    turn = turn === 'white' ? 'black' : 'white';
    if (turn === 'white') {
        moveNumber++;
    }

    // Add current board state to history for threefold repetition
    boardHistory.push(generateBoardFen());

    // Save the new state after the move is complete
    saveGameState();

    // Start timer for the next player IF in timer mode
    if (currentGameMode === 'timer') {
        startTimer();
    } else {
        // In normal mode, ensure active turn highlight is correctly updated
        updateTimerDisplay(); // This function also handles active-turn highlighting
    }
    // Reset selection and re-render
    selectedSquareId = null;
    legalMoves = [];
    renderBoard(); // Re-render the entire board to reflect changes
}

/**
 * Adds a move to the displayed history list (updates the internal moveHistory array).
 * @param {string} fromId - Starting square ID.
 * @param {string} toId - Destination square ID.
 * @param {string} pieceMoved - Character of the piece moved.
 * @param {string} capturedPiece - Character of the captured piece (or empty string).
 */
function addMoveToHistory(fromId, toId, pieceMoved, capturedPiece) {
    const moveText = `${fromId}-${toId}${capturedPiece ? ' (x' + PIECES[capturedPiece] + ')' : ''}`;
    
    // Push to the internal moveHistory array
    moveHistory.push({ turn: getOpponentColor(turn), moveText }); // Store the turn that *made* the move
}

/**
 * Rebuilds the moves list UI based on the current moveHistory array.
 */
function updateMovesListUI() {
    movesListElement.innerHTML = ''; // Clear existing list
    let currentMoveNumber = 1;
    let currentLi = null;

    for (let i = 0; i < moveHistory.length; i++) {
        const move = moveHistory[i];
        if (move.turn === 'white') {
            if (currentLi) { // If there's an open li from a previous black move, close it
                movesListElement.appendChild(currentLi);
            }
            currentLi = document.createElement('li');
            currentLi.innerHTML = `<span class="move-number">${currentMoveNumber}.</span> <span class="move-white">${move.moveText}</span> <span class="move-black"></span>`;
            currentMoveNumber++;
        } else { // black's move
            if (!currentLi) { // Should not happen if white always moves first in a pair
                currentLi = document.createElement('li');
                currentLi.innerHTML = `<span class="move-number">${currentMoveNumber}.</span> <span class="move-white"></span> <span class="move-black"></span>`;
            }
            const blackMoveSpan = currentLi.querySelector('.move-black');
            if (blackMoveSpan) {
                blackMoveSpan.textContent = move.moveText;
            }
            movesListElement.appendChild(currentLi); // Append the complete move pair
            currentLi = null; // Reset for next pair
        }
    }
    // If there's an unclosed li (odd number of moves, last was white)
    if (currentLi) {
        movesListElement.appendChild(currentLi);
    }
    // Scroll to the bottom of the moves list
    movesListElement.scrollTop = movesListElement.scrollHeight;
}


// --- Event Listeners for Control Buttons ---

// Home Page Start Button
startGameButton.addEventListener('click', () => {
    currentPlayerColor = selectWhiteRadio.checked ? 'white' : 'black';
    currentGameMode = modeTimerRadio.checked ? 'timer' : 'normal';
    
    displayPage('game'); // Switch to game page
    initializeBoard(); // Initialize the game based on selections
});


newGameButton.addEventListener('click', () => {
    initializeBoard();
    statusMessageElement.textContent = 'New game started! White to move.';
    // Re-enable board interaction and start timer
    document.querySelectorAll('.square').forEach(sq => {
        sq.addEventListener('click', handleSquareClick);
        sq.style.cursor = 'pointer';
    });
    gameActive = true;
    if (currentGameMode === 'timer') {
        startTimer();
    } else {
        updateTimerDisplay(); // Clear timer highlight if normal mode and ensure inactive style
    }
    updateUndoRedoButtons(); // Enable undo/redo for new game
});

resignButton.addEventListener('click', () => {
    stopTimer(); // Stop timer
    gameActive = false; // Mark game inactive
    const winner = turn === 'white' ? 'Black' : 'White';
    statusMessageElement.textContent = `${turn.charAt(0).toUpperCase() + turn.slice(1)} resigned! ${winner} wins!`;
    disableBoardInteraction();
    updateUndoRedoButtons(); // Disable undo/redo after game ends
});

offerDrawButton.addEventListener('click', () => {
    // In a real game, this would trigger a confirmation for the other player
    // For now, it just updates the status message.
    statusMessageElement.textContent = `${turn.charAt(0).toUpperCase() + turn.slice(1)} offered a draw.`;
    // If the draw is accepted, you'd call stopTimer() and disableBoardInteraction()
});

undoButton.addEventListener('click', () => {
    if (currentStateIndex > 0) {
        loadGameState(currentStateIndex - 1);
    }
});

redoButton.addEventListener('click', () => {
    if (currentStateIndex < gameStates.length - 1) {
        loadGameState(currentStateIndex + 1);
    }
});

backToHomeButton.addEventListener('click', () => {
    displayPage('home');
});


// --- Initialize Game on Window Load ---
window.onload = () => {
    displayPage('home'); // Show the home page first
};