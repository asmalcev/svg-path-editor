import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { PathCommand } from '../types/svg';

interface CommandListProps {
    commands: PathCommand[];
    selectedCommandIndex: number | null;
    selectedPointIndex: number | null;
    onSelect: (commandIndex: number | null, pointIndex: number | null) => void;
    onReorder: (dragIndex: number, hoverIndex: number) => void;
    onAddCommand: (type: PathCommand['type']) => void;
    onDeleteCommand: (index: number) => void;
}

interface CommandItemProps {
    command: PathCommand;
    index: number;
    isSelected: boolean;
    selectedPointIndex: number | null;
    onSelect: (commandIndex: number, pointIndex: number) => void;
    onReorder: (dragIndex: number, hoverIndex: number) => void;
    onDelete: () => void;
}

const CommandItem: React.FC<CommandItemProps> = ({
    command,
    index,
    isSelected,
    selectedPointIndex,
    onSelect,
    onReorder,
    onDelete,
}) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'COMMAND',
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const [, drop] = useDrop(() => ({
        accept: 'COMMAND',
        hover: (item: { index: number }) => {
            if (item.index === index) return;
            onReorder(item.index, index);
            item.index = index;
        },
    }));

    const ref = (node: HTMLDivElement | null) => {
        drag(drop(node));
    };

    return (
        <div
            ref={ref}
            className={`command-item ${isSelected ? 'selected' : ''} ${
                isDragging ? 'dragging' : ''
            }`}
        >
            <div className="command-header" onClick={() => onSelect(index, 0)}>
                <span className="command-type">{command.type}</span>
                <button className="delete-btn" onClick={onDelete}>
                    ×
                </button>
            </div>
            <div className="command-points">
                {command.points.map((point, pointIndex) => (
                    <div
                        key={pointIndex}
                        className={`point-item ${
                            selectedPointIndex === pointIndex ? 'selected' : ''
                        }`}
                        onClick={() => onSelect(index, pointIndex)}
                    >
                        <span className="point-label">
                            Point {pointIndex + 1}
                        </span>
                        <span className="point-coordinates">
                            ({point.x}, {point.y})
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CommandList: React.FC<CommandListProps> = ({
    commands,
    selectedCommandIndex,
    selectedPointIndex,
    onSelect,
    onReorder,
    onAddCommand,
    onDeleteCommand,
}) => {
    const commandTypes: PathCommand['type'][] = [
        'M',
        'L',
        'H',
        'V',
        'C',
        'S',
        'Q',
        'T',
        'A',
        'Z',
    ];

    return (
        <div className="command-list">
            <div className="command-tools">
                <h3>Add Command</h3>
                <div className="command-buttons">
                    {commandTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => onAddCommand(type)}
                            className="add-command-btn"
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
            <div className="commands">
                {commands.map((command, cmdIndex) => (
                    <CommandItem
                        key={cmdIndex}
                        command={command}
                        index={cmdIndex}
                        isSelected={selectedCommandIndex === cmdIndex}
                        selectedPointIndex={
                            selectedCommandIndex === cmdIndex
                                ? selectedPointIndex
                                : null
                        }
                        onSelect={onSelect}
                        onReorder={onReorder}
                        onDelete={() => onDeleteCommand(cmdIndex)}
                    />
                ))}
            </div>
        </div>
    );
};
