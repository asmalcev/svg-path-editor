import React, { useRef, useEffect, useCallback } from 'react';
import { PathCommand, Point } from '../types/svg';

interface SvgPreviewProps {
    commands: PathCommand[];
    onPointDrag: (
        commandIndex: number,
        pointIndex: number,
        newPoint: Point
    ) => void;
    selectedCommandIndex: number | null;
    selectedPointIndex: number | null;
    onSelect: (commandIndex: number | null, pointIndex: number | null) => void;
}

interface DraggablePointProps {
    point: Point;
    commandIndex: number;
    pointIndex: number;
    isSelected: boolean;
    onSelect: (commandIndex: number, pointIndex: number) => void;
}

const DraggablePoint: React.FC<DraggablePointProps> = ({
    point,
    commandIndex,
    pointIndex,
    isSelected,
    onSelect,
}) => {
    return (
        <circle
            cx={point.x}
            cy={point.y}
            r={isSelected ? 6 : 4}
            fill={isSelected ? '#ff0000' : '#0000ff'}
            stroke="#ffffff"
            strokeWidth={2}
            style={{ cursor: 'move' }}
            onClick={() => onSelect(commandIndex, pointIndex)}
            data-command-index={commandIndex}
            data-point-index={pointIndex}
        />
    );
};

const generatePathData = (cmds: PathCommand[]): string => {
    return cmds
        .map((cmd) => {
            switch (cmd.type) {
                case 'M':
                    return `M ${cmd.points[0].x} ${cmd.points[0].y}`;
                case 'L':
                    return `L ${cmd.points[0].x} ${cmd.points[0].y}`;
                case 'H':
                    return `H ${cmd.points[0].x}`;
                case 'V':
                    return `V ${cmd.points[0].y}`;
                case 'C':
                    return `C ${cmd.points[0].x} ${cmd.points[0].y}, ${cmd.points[1].x} ${cmd.points[1].y}, ${cmd.points[2].x} ${cmd.points[2].y}`;
                case 'S':
                    return `S ${cmd.points[0].x} ${cmd.points[0].y}, ${cmd.points[1].x} ${cmd.points[1].y}`;
                case 'Q':
                    return `Q ${cmd.points[0].x} ${cmd.points[0].y}, ${cmd.points[1].x} ${cmd.points[1].y}`;
                case 'T':
                    return `T ${cmd.points[0].x} ${cmd.points[0].y}`;
                case 'A':
                    return `A ${cmd.points[0].x} ${cmd.points[0].y} ${cmd.points[1].x} ${cmd.points[1].y} ${cmd.points[2].x} ${cmd.points[2].y}`;
                case 'Z':
                    return 'Z';
                default:
                    return '';
            }
        })
        .join(' ');
};

export const SvgPreview: React.FC<SvgPreviewProps> = ({
    commands,
    onPointDrag,
    selectedCommandIndex,
    selectedPointIndex,
    onSelect,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const isDraggingRef = useRef(false);
    const draggedPointRef = useRef<{
        commandIndex: number;
        pointIndex: number;
    } | null>(null);

    const handleMouseDown = useCallback((e: MouseEvent) => {
        const target = e.target as SVGCircleElement;
        if (!target.matches('circle')) return;

        const commandIndex = parseInt(target.dataset.commandIndex || '0', 10);
        const pointIndex = parseInt(target.dataset.pointIndex || '0', 10);

        isDraggingRef.current = true;
        draggedPointRef.current = { commandIndex, pointIndex };
        target.style.opacity = '0.5';
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (
                !isDraggingRef.current ||
                !draggedPointRef.current ||
                !svgRef.current
            )
                return;

            const svg = svgRef.current;
            const CTM = svg.getScreenCTM();
            if (!CTM) return;

            const point = svg.createSVGPoint();
            point.x = e.clientX;
            point.y = e.clientY;
            const transformedPoint = point.matrixTransform(CTM.inverse());

            onPointDrag(
                draggedPointRef.current.commandIndex,
                draggedPointRef.current.pointIndex,
                {
                    x: Math.round(transformedPoint.x),
                    y: Math.round(transformedPoint.y),
                }
            );
        },
        [onPointDrag]
    );

    const handleMouseUp = useCallback(() => {
        if (
            !isDraggingRef.current ||
            !draggedPointRef.current ||
            !svgRef.current
        )
            return;

        const svg = svgRef.current;
        const circle = svg.querySelector(
            `circle[data-command-index="${draggedPointRef.current.commandIndex}"][data-point-index="${draggedPointRef.current.pointIndex}"]`
        ) as SVGCircleElement;
        if (circle) {
            circle.style.opacity = '1';
        }

        isDraggingRef.current = false;
        draggedPointRef.current = null;
    }, []);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        svg.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            svg.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseDown, handleMouseMove, handleMouseUp]);

    return (
        <div className="svg-preview">
            <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 600">
                <path
                    d={generatePathData(commands)}
                    fill="none"
                    stroke="#000"
                    strokeWidth="2"
                />
                {commands.map((cmd, cmdIndex) =>
                    cmd.points.map((point, pointIndex) => (
                        <DraggablePoint
                            key={`${cmdIndex}-${pointIndex}`}
                            point={point}
                            commandIndex={cmdIndex}
                            pointIndex={pointIndex}
                            isSelected={
                                selectedCommandIndex === cmdIndex &&
                                selectedPointIndex === pointIndex
                            }
                            onSelect={onSelect}
                        />
                    ))
                )}
            </svg>
        </div>
    );
};
