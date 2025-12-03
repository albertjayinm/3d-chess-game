import React, { useMemo } from 'react';
import { Color } from 'three';
import { PieceColor, PieceType } from '../types';

interface PieceProps {
  type: PieceType;
  color: PieceColor;
  position: [number, number, number];
  onClick?: (e: any) => void;
  isSelected?: boolean;
}

const MATERIALS = {
  w: new Color('#e2e8f0'), // Slate-200
  b: new Color('#1e293b'), // Slate-800
  selected: new Color('#fbbf24'), // Amber-400
};

export const ChessPiece: React.FC<PieceProps> = ({ type, color, position, onClick, isSelected }) => {
  const pieceColor = isSelected ? MATERIALS.selected : (color === 'w' ? MATERIALS.w : MATERIALS.b);
  
  // Rotate knights to face appropriate direction
  // White knights face forward (positive Z), Black knights face backward (negative Z)
  // Actually in this coordinate system, usually pieces face center or opponent.
  // Let's standardise: White pieces at z=~7 facing z=0 (Negative Rotation), Black at z=0 facing z=7.
  // Current board setup: a1 is [0,7] -> x=-3.5, z=3.5. White is at z positive. Black is z negative.
  // Wait, Board.tsx logic: rank 8 is z = -3.5 (Black side usually), rank 1 is z = 3.5 (White side).
  // So White looks towards negative Z. Black looks towards positive Z.
  
  let rotation: [number, number, number] = [0, 0, 0];
  if (type === 'n') {
      rotation = color === 'w' ? [0, Math.PI, 0] : [0, 0, 0];
  }

  return (
    <group position={position} onClick={onClick} rotation={rotation}>
        <PieceGeometry type={type} materialColor={pieceColor} />
    </group>
  );
};

const PieceGeometry: React.FC<{ type: PieceType; materialColor: Color }> = ({ type, materialColor }) => {
    const Material = <meshStandardMaterial color={materialColor} roughness={0.4} metalness={0.3} />;

    const Base = () => (
        <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.35, 0.4, 0.2, 32]} />
            {Material}
        </mesh>
    );

    switch(type) {
        case 'p': // Pawn
            return (
                <group scale={[0.8, 0.8, 0.8]}>
                    <mesh position={[0, 0.1, 0]}>
                        <cylinderGeometry args={[0.3, 0.35, 0.2, 16]} />
                        {Material}
                    </mesh>
                    <mesh position={[0, 0.4, 0]}>
                        <cylinderGeometry args={[0.15, 0.3, 0.6, 16]} />
                        {Material}
                    </mesh>
                    <mesh position={[0, 0.65, 0]}>
                         <torusGeometry args={[0.16, 0.05, 8, 16]} />
                         {Material}
                    </mesh>
                    <mesh position={[0, 0.85, 0]}>
                        <sphereGeometry args={[0.22, 16, 16]} />
                        {Material}
                    </mesh>
                </group>
            );
        case 'r': // Rook
            return (
                <group scale={[0.9, 0.9, 0.9]}>
                    <Base />
                    <mesh position={[0, 0.5, 0]}>
                        <cylinderGeometry args={[0.28, 0.3, 0.8, 32]} />
                        {Material}
                    </mesh>
                    {/* Turret top */}
                    <mesh position={[0, 0.95, 0]}>
                         <cylinderGeometry args={[0.35, 0.35, 0.2, 32]} />
                         {Material}
                    </mesh>
                    {/* Battlements */}
                    {[0, Math.PI/2, Math.PI, -Math.PI/2].map((rot, i) => (
                         <mesh key={i} position={[Math.sin(rot)*0.25, 1.1, Math.cos(rot)*0.25]} rotation={[0, rot, 0]}>
                            <boxGeometry args={[0.15, 0.15, 0.15]} />
                            {Material}
                         </mesh>
                    ))}
                </group>
            );
        case 'n': // Knight
            return (
                 <group scale={[0.9, 0.9, 0.9]}>
                    <Base />
                    <mesh position={[0, 0.4, 0]}>
                        <cylinderGeometry args={[0.25, 0.32, 0.6, 16]} />
                        {Material}
                    </mesh>
                    {/* Neck/Head Group */}
                    <group position={[0, 0.6, 0]}>
                         {/* Neck */}
                         <mesh position={[0, 0.3, -0.1]} rotation={[0.4, 0, 0]}>
                            <boxGeometry args={[0.25, 0.6, 0.35]} />
                            {Material}
                         </mesh>
                         {/* Snout */}
                         <mesh position={[0, 0.55, 0.2]} rotation={[0.2, 0, 0]}>
                            <boxGeometry args={[0.22, 0.25, 0.4]} />
                            {Material}
                         </mesh>
                         {/* Mane details */}
                         <mesh position={[0, 0.5, -0.25]} rotation={[0.3, 0, 0]}>
                             <boxGeometry args={[0.1, 0.5, 0.1]} />
                             {Material}
                         </mesh>
                         {/* Ears */}
                         <mesh position={[0.1, 0.75, -0.1]} rotation={[0, 0, -0.2]}>
                             <coneGeometry args={[0.05, 0.2, 4]} />
                             {Material}
                         </mesh>
                         <mesh position={[-0.1, 0.75, -0.1]} rotation={[0, 0, 0.2]}>
                             <coneGeometry args={[0.05, 0.2, 4]} />
                             {Material}
                         </mesh>
                    </group>
                </group>
            );
        case 'b': // Bishop
            return (
                <group scale={[0.9, 0.9, 0.9]}>
                    <Base />
                    <mesh position={[0, 0.5, 0]}>
                        <cylinderGeometry args={[0.2, 0.32, 0.8, 16]} />
                        {Material}
                    </mesh>
                    <mesh position={[0, 0.85, 0]}>
                        <torusGeometry args={[0.2, 0.04, 8, 16]} rotation={[Math.PI/2, 0, 0]}/>
                        {Material}
                    </mesh>
                    {/* Mitre head */}
                    <mesh position={[0, 1.15, 0]} scale={[1, 1.5, 1]}>
                         <sphereGeometry args={[0.22, 16, 16]} />
                         {Material}
                    </mesh>
                    {/* Finial */}
                    <mesh position={[0, 1.55, 0]}>
                         <sphereGeometry args={[0.06, 8, 8]} />
                         {Material}
                    </mesh>
                </group>
            );
        case 'q': // Queen
            return (
                <group>
                    <Base />
                    {/* Body - hourglass effect */}
                    <mesh position={[0, 0.3, 0]}>
                        <cylinderGeometry args={[0.25, 0.35, 0.4, 32]} />
                        {Material}
                    </mesh>
                    <mesh position={[0, 0.6, 0]}>
                        <cylinderGeometry args={[0.15, 0.25, 0.5, 32]} />
                        {Material}
                    </mesh>
                    <mesh position={[0, 0.9, 0]}>
                         <torusGeometry args={[0.2, 0.06, 8, 32]} rotation={[Math.PI/2, 0, 0]}/>
                         {Material}
                    </mesh>
                    {/* Crown */}
                    <mesh position={[0, 1.15, 0]}>
                        <cylinderGeometry args={[0.3, 0.1, 0.5, 16, 1, true]} />
                        <meshStandardMaterial color={materialColor} side={2} roughness={0.4} metalness={0.3} />
                    </mesh>
                    <mesh position={[0, 1.15, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
                         {Material}
                    </mesh>
                    <mesh position={[0, 1.45, 0]}>
                        <sphereGeometry args={[0.12, 16, 16]} />
                        {Material}
                    </mesh>
                </group>
            );
        case 'k': // King
            return (
                <group>
                     <Base />
                    <mesh position={[0, 0.5, 0]}>
                        <cylinderGeometry args={[0.25, 0.38, 0.9, 32]} />
                        {Material}
                    </mesh>
                    <mesh position={[0, 1.0, 0]}>
                        <torusGeometry args={[0.22, 0.08, 8, 32]} rotation={[Math.PI/2, 0, 0]}/>
                        {Material}
                    </mesh>
                    {/* Top Section */}
                    <mesh position={[0, 1.15, 0]}>
                         <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
                         {Material}
                    </mesh>
                    {/* Cross */}
                    <group position={[0, 1.45, 0]}>
                        <mesh position={[0, 0, 0]}>
                            <boxGeometry args={[0.1, 0.4, 0.1]} />
                            {Material}
                        </mesh>
                        <mesh position={[0, 0.1, 0]}>
                            <boxGeometry args={[0.3, 0.1, 0.1]} />
                            {Material}
                        </mesh>
                    </group>
                </group>
            );
        default: return null;
    }
}
