export type Point = {
    x: number;
    y: number;
};

export type PathCommand = {
    type: 'M' | 'L' | 'H' | 'V' | 'C' | 'S' | 'Q' | 'T' | 'A' | 'Z';
    points: Point[];
    relative?: boolean;
};

export type PathState = {
    commands: PathCommand[];
    selectedCommandIndex: number | null;
    selectedPointIndex: number | null;
};
