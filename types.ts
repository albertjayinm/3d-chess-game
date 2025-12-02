import { Square } from 'chess.js';

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface BoardPosition {
  type: PieceType;
  color: PieceColor;
}

export interface SelectedSquare {
  square: Square;
  validMoves: Square[];
}

export interface ThemeColors {
  light: string;
  dark: string;
  highlight: string;
  check: string;
  moveHint: string;
}
