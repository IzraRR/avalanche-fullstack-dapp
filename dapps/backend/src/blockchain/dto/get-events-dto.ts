import { ApiProperty } from "@nestjs/swagger";

export class GetEventsDto {
    @ApiProperty({
        description: "Block number where the event was emitted",
        example: "100000",
    })
    fromBlock: number;
    @ApiProperty({
        description: "Block number where the event was emitted",
        example: "100100",
    })
    toBlock: number;
}