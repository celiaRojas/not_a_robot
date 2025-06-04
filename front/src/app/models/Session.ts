export interface Session {
    id: number,
    name: string,
    date: Date,
    duration: string,
    status?: string,
    userId?: number
}