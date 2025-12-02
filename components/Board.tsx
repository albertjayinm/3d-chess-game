import React, { useMemo, useRef, useState } from 'react';
import { Chess, Square as ChessSquare, Piece } from 'chess.js';
import { useFrame } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import { ChessPiece } from './Pieces';
import { SelectedSquare, ThemeColors } from '../types';
import { Text } from '@react-three/drei';

interface BoardProps {
  game: Chess;
  selected: SelectedSquare | null;
  onSquareClick: (square: ChessSquare) => void;
  isBlackBottom?: boolean;
  fen: string;
  animatingMove: { from: ChessSquare; to: ChessSquare; piece: Piece } | null;
  onAnimationComplete: () => void;
}

const COLORS: ThemeColors = {
  light: '#f0d9b5', // Classic wood light
  dark: '#b58863',  // Classic wood dark
  highlight: '#7b61ff', // Selection Blue/Purple
  moveHint: 'rgba(100, 255, 100, 0.5)',
  check: '#ef4444'
};

// Helper to convert algebraic square (e.g., 'e4') to 3D world position
const getPositionFromSquare = (square: ChessSquare): [number, number, number] => {
  const file = square.charCodeAt(0) - 97; // 'a' -> 0
  const rank = 8 - parseInt(square[1]);   // '8' -> 0, '1' -> 7
  
  const x = file - 3.5;
  const z = rank - 3.5;
  return [x, 0, z];
};

const BoardSquare: React.FC<{
  position: [number, number, number];
  color: string;
  isHint: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  onClick: (e: any) => void;
  squareName: string;
}> = ({ position, color, isHint, isLastMove, isCheck, onClick, squareName }) => {
  // Priority: Check > LastMove > Normal
  const materialColor = isCheck ? COLORS.check : (isLastMove ? '#fbbf24' : color);

  return (
    <mesh position={position} onClick={(e) => { e.stopPropagation(); onClick(e); }} receiveShadow>
      <boxGeometry args={[1, 0.2, 1]} />
      <meshStandardMaterial 
        color={materialColor} 
        roughness={0.8}
      />
      {isHint && (
        <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.3, 32]} />
          <meshBasicMaterial color="#4ade80" />
        </mesh>
      )}
    </mesh>
  );
};

// Component to handle the smooth arc animation
const AnimatedPiece: React.FC<{
  piece: Piece;
  from: ChessSquare;
  to: ChessSquare;
  onComplete: () => void;
}> = ({ piece, from, to, onComplete }) => {
  const groupRef = useRef<any>(null);
  const [startPos] = useState(() => {
    const p = getPositionFromSquare(from);
    return new Vector3(p[0], p[1], p[2]);
  });
  const [endPos] = useState(() => {
    const p = getPositionFromSquare(to);
    return new Vector3(p[0], p[1], p[2]);
  });
  
  // Animation state
  const progress = useRef(0);
  const ANIMATION_DURATION = 0.5; // seconds

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    progress.current += delta / ANIMATION_DURATION;
    
    if (progress.current >= 1) {
      progress.current = 1;
      onComplete();
    }

    const t = progress.current;
    
    // Smooth easing
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    // Linear interpolation for X and Z
    const currentX = MathUtils.lerp(startPos.x, endPos.x, ease);
    const currentZ = MathUtils.lerp(startPos.z, endPos.z, ease);
    
    // Parabolic arc for Y (Pick up and drop)
    // Sin(0) = 0, Sin(PI/2) = 1, Sin(PI) = 0
    const jumpHeight = 1.5;
    const currentY = Math.sin(t * Math.PI) * jumpHeight;

    groupRef.current.position.set(currentX, currentY, currentZ);
  });

  return (
    <group ref={groupRef} position={[startPos.x, 0, startPos.z]}>
      <ChessPiece
        type={piece.type}
        color={piece.color}
        position={[0, 0, 0]} // Position handled by parent group
        isSelected={true} // Highlight while moving
      />
    </group>
  );
};

export const Board: React.FC<BoardProps> = ({ 
  game, 
  selected, 
  onSquareClick, 
  isBlackBottom, 
  fen, 
  animatingMove, 
  onAnimationComplete 
}) => {
  const board = game.board(); // 8x8 array
  const squares = useMemo(() => {
    const sqs = [];
    const inCheck = game.inCheck();
    const turn = game.turn();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isDark = (r + c) % 2 === 1;
        
        const x = c - 3.5;
        const z = r - 3.5;
        
        const file = String.fromCharCode(97 + c); // a, b, c...
        const rank = String(8 - r); // 8, 7, 6...
        const squareName = `${file}${rank}` as ChessSquare;

        const piece = board[r][c];
        const isSelected = selected?.square === squareName;
        const isHint = selected?.validMoves.includes(squareName);

        // Check if this square was part of the last move
        const history = game.history({ verbose: true });
        const lastMove = history.length > 0 ? history[history.length - 1] : null;
        const isLastMove = lastMove ? (lastMove.from === squareName || lastMove.to === squareName) : false;

        // Check highlight: if in check, highlight the king of the current turn
        const isCheckSquare = inCheck && piece?.type === 'k' && piece?.color === turn;

        // If this piece is currently animating from this square, we hide the static version
        const isAnimatingFrom = animatingMove?.from === squareName;

        sqs.push({
          x,
          z,
          r,
          c,
          squareName,
          isDark,
          piece,
          isSelected,
          isHint,
          isLastMove,
          isCheckSquare,
          isAnimatingFrom
        });
      }
    }
    return sqs;
  }, [game, selected, fen, animatingMove]); // Re-calc when game state or animation changes

  return (
    <group>
        {/* Board Border */}
        <mesh position={[0, -0.2, 0]} receiveShadow>
            <boxGeometry args={[9, 0.2, 9]} />
            <meshStandardMaterial color="#475569" />
        </mesh>

        {squares.map((sq) => (
            <group key={sq.squareName}>
                <BoardSquare
                    position={[sq.x, 0, sq.z]}
                    color={sq.isDark ? COLORS.dark : COLORS.light}
                    isHint={!!sq.isHint}
                    isLastMove={sq.isLastMove}
                    isCheck={sq.isCheckSquare}
                    onClick={() => onSquareClick(sq.squareName)}
                    squareName={sq.squareName}
                />
                
                {/* Render static piece if it exists and is NOT currently lifting off to move */}
                {sq.piece && !sq.isAnimatingFrom && (
                    <ChessPiece
                        type={sq.piece.type}
                        color={sq.piece.color}
                        position={[sq.x, 0, sq.z]}
                        isSelected={sq.isSelected}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSquareClick(sq.squareName);
                        }}
                    />
                )}

                {/* Coordinate Labels - Render only on edges */}
                {sq.r === 7 && (
                    <Text 
                        position={[sq.x, 0.11, 4]} 
                        rotation={[-Math.PI/2, 0, 0]} 
                        fontSize={0.3} 
                        color="#94a3b8"
                    >
                        {sq.squareName.charAt(0)}
                    </Text>
                )}
                {sq.c === 0 && (
                    <Text 
                        position={[-4, 0.11, sq.z]} 
                        rotation={[-Math.PI/2, 0, 0]} 
                        fontSize={0.3} 
                        color="#94a3b8"
                    >
                        {sq.squareName.charAt(1)}
                    </Text>
                )}
            </group>
        ))}

        {/* Floating Animated Piece */}
        {animatingMove && (
          <AnimatedPiece
            piece={animatingMove.piece}
            from={animatingMove.from}
            to={animatingMove.to}
            onComplete={onAnimationComplete}
          />
        )}
    </group>
  );
};