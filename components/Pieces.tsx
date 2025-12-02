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

const Pawn: React.FC<{ color: PieceColor }> = () => (
  <group>
    <mesh position={[0, 0.2, 0]}>
      <cylinderGeometry args={[0.2, 0.3, 0.4, 16]} />
      <meshStandardMaterial color={MATERIALS.w} />
    </mesh>
    <mesh position={[0, 0.55, 0]}>
      <sphereGeometry args={[0.18, 16, 16]} />
      <meshStandardMaterial color={MATERIALS.w} />
    </mesh>
  </group>
);

const Rook: React.FC<{ color: PieceColor }> = () => (
  <group>
    <mesh position={[0, 0.4, 0]}>
      <cylinderGeometry args={[0.25, 0.3, 0.8, 16]} />
      <meshStandardMaterial color={MATERIALS.w} />
    </mesh>
    <mesh position={[0, 0.85, 0]}>
      <cylinderGeometry args={[0.28, 0.28, 0.1, 8]} />
      <meshStandardMaterial color={MATERIALS.w} />
    </mesh>
  </group>
);

const Knight: React.FC<{ color: PieceColor }> = () => (
  <group>
    <mesh position={[0, 0.3, 0]}>
      <cylinderGeometry args={[0.25, 0.3, 0.6, 16]} />
      <meshStandardMaterial color={MATERIALS.w} />
    </mesh>
    <mesh position={[0, 0.7, 0.1]} rotation={[-0.2, 0, 0]}>
      <boxGeometry args={[0.25, 0.4, 0.5]} />
      <meshStandardMaterial color={MATERIALS.w} />
    </mesh>
  </group>
);

const Bishop: React.FC<{ color: PieceColor }> = () => (
  <group>
    <mesh position={[0, 0.4, 0]}>
      <cylinderGeometry args={[0.2, 0.3, 0.8, 16]} />
      <meshStandardMaterial color={MATERIALS.w} />
    </mesh>
    <mesh position={[0, 0.9, 0]}>
      <cylinderGeometry args={[0.05, 0.2, 0.3, 16]} />
      <meshStandardMaterial color={MATERIALS.w} />
    </mesh>
    <mesh position={[0, 1.1, 0]}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshStandardMaterial color={MATERIALS.w} />
    </mesh>
  </group>
);

const Queen: React.FC<{ color: PieceColor }> = () => (
  <group>
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.25, 0.35, 1.0, 16]} />
      <meshStandardMaterial color={MATERIALS.w} />
    </mesh>
    <mesh position={[0, 1.1, 0]}>
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshStandardMaterial color={MATERIALS.w} />
    </mesh>
    <mesh position={[0, 1.35, 0]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color={MATERIALS.w} />
    </mesh>
  </group>
);

const King: React.FC<{ color: PieceColor }> = () => (
  <group>
    <mesh position={[0, 0.6, 0]}>
      <cylinderGeometry args={[0.25, 0.35, 1.2, 16]} />
      <meshStandardMaterial color={MATERIALS.w} />
    </mesh>
    <mesh position={[0, 1.3, 0]}>
      <boxGeometry args={[0.3, 0.1, 0.1]} />
      <meshStandardMaterial color={MATERIALS.w} />
    </mesh>
    <mesh position={[0, 1.3, 0]}>
      <boxGeometry args={[0.1, 0.3, 0.1]} />
      <meshStandardMaterial color={MATERIALS.w} />
    </mesh>
  </group>
);

export const ChessPiece: React.FC<PieceProps> = ({ type, color, position, onClick, isSelected }) => {
  const Component = useMemo(() => {
    switch (type) {
      case 'p': return Pawn;
      case 'r': return Rook;
      case 'n': return Knight;
      case 'b': return Bishop;
      case 'q': return Queen;
      case 'k': return King;
      default: return Pawn;
    }
  }, [type]);

  const pieceColor = isSelected ? MATERIALS.selected : (color === 'w' ? MATERIALS.w : MATERIALS.b);
  // Rotate pieces to face each other
  const rotation: [number, number, number] = color === 'b' ? [0, Math.PI, 0] : [0, 0, 0];

  return (
    <group position={position} onClick={onClick} rotation={rotation}>
        {/* We override the material color in the children by traversing or using context, 
            but for this simple procedural approach, we can just tint the group or use a specialized material logic.
            To keep it simple with procedural geometries that hardcoded <meshStandardMaterial>,
            we will wrap them in a group and use a property to tint them if possible, 
            OR we just render the geometry here with the correct material.
            
            Refactoring to render geometry directly here for easier material control.
        */}
        <group>
            {/* Re-implementing simplified geometry maps to apply material cleanly */}
             <PieceGeometry type={type} materialColor={pieceColor} />
        </group>
    </group>
  );
};

const PieceGeometry: React.FC<{ type: PieceType; materialColor: Color }> = ({ type, materialColor }) => {
    const Material = <meshStandardMaterial color={materialColor} roughness={0.3} metalness={0.4} />;

    switch(type) {
        case 'p': // Pawn
            return (
                <group scale={[0.8, 0.8, 0.8]}>
                     <mesh position={[0, 0.25, 0]}>
                        <cylinderGeometry args={[0.25, 0.35, 0.5, 16]} />
                        {Material}
                    </mesh>
                    <mesh position={[0, 0.6, 0]}>
                        <sphereGeometry args={[0.2, 16, 16]} />
                        {Material}
                    </mesh>
                </group>
            );
        case 'r': // Rook
            return (
                <group scale={[0.9, 0.9, 0.9]}>
                    <mesh position={[0, 0.4, 0]}>
                        <cylinderGeometry args={[0.3, 0.35, 0.8, 16]} />
                        {Material}
                    </mesh>
                    <mesh position={[0, 0.9, 0]}>
                         <cylinderGeometry args={[0.35, 0.35, 0.2, 8]} />
                         {Material}
                    </mesh>
                </group>
            );
        case 'n': // Knight
            return (
                 <group scale={[0.9, 0.9, 0.9]}>
                    <mesh position={[0, 0.3, 0]}>
                        <cylinderGeometry args={[0.3, 0.35, 0.6, 16]} />
                        {Material}
                    </mesh>
                    <mesh position={[0, 0.8, 0.15]} rotation={[-0.3, 0, 0]}>
                        <boxGeometry args={[0.25, 0.5, 0.35]} />
                        {Material}
                    </mesh>
                     <mesh position={[0, 1.0, 0.3]} rotation={[-0.3, 0, 0]}>
                        <boxGeometry args={[0.2, 0.2, 0.3]} />
                        {Material}
                    </mesh>
                </group>
            );
        case 'b': // Bishop
            return (
                <group scale={[0.9, 0.9, 0.9]}>
                    <mesh position={[0, 0.4, 0]}>
                        <cylinderGeometry args={[0.25, 0.35, 0.8, 16]} />
                        {Material}
                    </mesh>
                    <mesh position={[0, 0.95, 0]}>
                         <coneGeometry args={[0.2, 0.4, 16]} />
                         {Material}
                    </mesh>
                </group>
            );
        case 'q': // Queen
            return (
                <group>
                    <mesh position={[0, 0.6, 0]}>
                        <cylinderGeometry args={[0.28, 0.4, 1.2, 16]} />
                        {Material}
                    </mesh>
                    <mesh position={[0, 1.3, 0]}>
                        <sphereGeometry args={[0.25, 16, 16]} />
                        {Material}
                    </mesh>
                     <mesh position={[0, 1.5, 0]}>
                        <sphereGeometry args={[0.1, 8, 8]} />
                        {Material}
                    </mesh>
                </group>
            );
        case 'k': // King
            return (
                <group>
                    <mesh position={[0, 0.6, 0]}>
                        <cylinderGeometry args={[0.3, 0.4, 1.2, 16]} />
                        {Material}
                    </mesh>
                    <mesh position={[0, 1.35, 0]} rotation={[0, 0, 0]}>
                         <boxGeometry args={[0.35, 0.1, 0.1]} />
                         {Material}
                    </mesh>
                    <mesh position={[0, 1.35, 0]} rotation={[0, 0, 1.57]}>
                         <boxGeometry args={[0.35, 0.1, 0.1]} />
                         {Material}
                    </mesh>
                </group>
            );
        default: return null;
    }
}
