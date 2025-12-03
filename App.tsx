import React, { useState, useCallback, Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Stars } from '@react-three/drei';
import { Chess, Square, Piece } from 'chess.js';
import { Vector3, MathUtils } from 'three';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { SelectedSquare } from './types';

interface AnimatingMove {
  from: Square;
  to: Square;
  piece: Piece;
  promotion?: string;
}

interface CameraRequest {
  position: Vector3;
  target: Vector3;
  timestamp: number;
}

/**
 * CameraRig Component
 * Handles smooth interpolation of the camera and controls target based on requested state.
 */
const CameraRig: React.FC<{ request: CameraRequest | null, controlsRef: React.RefObject<any> }> = ({ request, controlsRef }) => {
  const { camera } = useThree();
  const vec = useRef(new Vector3());

  useFrame(() => {
    if (!request || !controlsRef.current) return;

    // Smoothly interpolate camera position
    camera.position.lerp(request.position, 0.05);
    
    // Smoothly interpolate orbit controls target (where camera looks)
    controlsRef.current.target.lerp(request.target, 0.05);
    
    // Required to update OrbitControls state after manual modification
    controlsRef.current.update();

    // Clean up request if we are "close enough" (optional, but good for performance if we stopped rendering loop)
    // For now, we just keep lerping which ensures it stays locked until user interacts again.
    // However, OrbitControls handles user interaction interruption automatically if we don't fight it too hard.
    // But since we lerp every frame while 'request' exists, we should probably clear it if user interacts.
    // That complexity is skipped for simplicity; clicking buttons forces the view back.
  });

  return null;
};

function App() {
  // Game State
  const [game, setGame] = useState(new Chess());
  const [selected, setSelected] = useState<SelectedSquare | null>(null);
  
  // Animation State
  const [animatingMove, setAnimatingMove] = useState<AnimatingMove | null>(null);

  // Camera State
  const [cameraRequest, setCameraRequest] = useState<CameraRequest | null>(null);
  const controlsRef = useRef<any>(null);

  // Force update for React to re-render when the chess instance changes internal state
  const [fen, setFen] = useState(game.fen());

  // Core Chess Logic and Move Validation
  const onSquareClick = useCallback((square: Square) => {
    // If game is over or currently animating, do nothing
    if (game.isGameOver() || animatingMove) return;

    // 1. If clicking the currently selected square, deselect
    if (selected?.square === square) {
      setSelected(null);
      return;
    }

    // 2. If a square is selected, check if the clicked square is a valid move
    if (selected) {
      // "validMoves" contains legal destination squares calculated by chess.js
      if (selected.validMoves.includes(square)) {
        
        // Handle Pawn Promotion: Defaulting to Queen for this interface.
        const piece = game.get(selected.square);
        
        // Initiate Animation instead of moving immediately
        if (piece) {
          setAnimatingMove({
            from: selected.square,
            to: square,
            piece: piece,
            promotion: 'q'
          });
          setSelected(null);
          return;
        }
      }
    }

    // 3. Select a piece (if it's the player's turn)
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      // Calculate valid moves for this piece
      const moves = game.moves({ square, verbose: true }).map((m) => m.to as Square);
      
      setSelected({
        square,
        validMoves: moves
      });
    } else {
        // Clicked empty square or enemy piece without a valid move selected
        setSelected(null);
    }
  }, [game, selected, animatingMove]); 

  // Called when the 3D animation finishes
  const handleAnimationComplete = useCallback(() => {
    if (!animatingMove) return;

    try {
        const moveResult = game.move({
            from: animatingMove.from,
            to: animatingMove.to,
            promotion: animatingMove.promotion
        });

        if (moveResult) {
            setFen(game.fen()); 
        }
    } catch (e) {
        console.error("Move failed after animation", e);
    } finally {
        setAnimatingMove(null);
    }
  }, [game, animatingMove]);

  const handleReset = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setSelected(null);
    setAnimatingMove(null);
    
    // Reset camera to white perspective/center
    handleCenterBoard();
  };

  const handleCenterBoard = () => {
    setCameraRequest({
      position: new Vector3(0, 8, 8),
      target: new Vector3(0, 0, 0),
      timestamp: Date.now()
    });
  };

  const handleSwitchPerspective = () => {
    const turn = game.turn();
    if (turn === 'w') {
        // White perspective: Positive Z
        setCameraRequest({
            position: new Vector3(0, 8, 10),
            target: new Vector3(0, 0, 0),
            timestamp: Date.now()
        });
    } else {
        // Black perspective: Negative Z
        setCameraRequest({
            position: new Vector3(0, 8, -10),
            target: new Vector3(0, 0, 0),
            timestamp: Date.now()
        });
    }
  };

  return (
    <div className="w-full h-full relative bg-slate-900">
      <Controls 
        game={game} 
        onReset={handleReset} 
        onCenterBoard={handleCenterBoard}
        onSwitchPerspective={handleSwitchPerspective}
        turn={game.turn()} 
        inCheck={game.inCheck()}
        isCheckmate={game.isCheckmate()}
        isDraw={game.isDraw()}
        isStalemate={game.isStalemate()}
        isThreefoldRepetition={game.isThreefoldRepetition()}
        isInsufficientMaterial={game.isInsufficientMaterial()}
      />

      <Canvas shadows camera={{ position: [0, 8, 8], fov: 45 }}>
        <Suspense fallback={null}>
            <CameraRig request={cameraRequest} controlsRef={controlsRef} />

            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
            <spotLight 
                position={[0, 15, 0]} 
                angle={0.3} 
                penumbra={1} 
                intensity={2} 
                castShadow 
                shadow-bias={-0.0001}
            />
            
            {/* Environment */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Environment preset="city" />

            {/* Game Board */}
            <group>
                <Board 
                    game={game} 
                    selected={selected} 
                    onSquareClick={onSquareClick}
                    fen={fen} 
                    animatingMove={animatingMove}
                    onAnimationComplete={handleAnimationComplete}
                />
                <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={1} color="#000000" />
            </group>

            {/* Controls */}
            <OrbitControls 
                ref={controlsRef}
                makeDefault
                minPolarAngle={0} 
                maxPolarAngle={Math.PI / 2.2} // Don't let go below board
                minDistance={5}
                maxDistance={20}
                onStart={() => {
                  // If user manually interacts, stop the automated smoothing to prevent fighting
                  // We do this by setting request to null on next tick or logically ignoring it.
                  // For now, simpler to just let user override visually, but ideally we clear state.
                  setCameraRequest(null);
                }}
            />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;