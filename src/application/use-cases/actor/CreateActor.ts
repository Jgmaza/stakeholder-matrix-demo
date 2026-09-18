/**
 * Application Use Case: Create Actor
 */

import { Actor, CreateActorDto } from "@/domain/entities/Actor";
import { ActorRepository } from "@/domain/repositories/ActorRepository";
import { MatrixMapping } from "@/domain/value-objects/MatrixMapping";

export class CreateActor {
  constructor(
    private repository: ActorRepository,
    private matrixMapping: MatrixMapping
  ) {}

  async execute(data: CreateActorDto, userId: number): Promise<Actor> {
    // Calculate matrix values if relacion and nivelPoder are provided
    const interes = this.matrixMapping.mapRelacionToInteres(data.relacion);
    const poder = this.matrixMapping.mapPoderToValue(data.nivelPoder);

    const actorData: CreateActorDto = {
      ...data,
    };

    const actor = await this.repository.create(actorData, userId);

    // Add calculated values
    return {
      ...actor,
      interes,
      poder,
    };
  }
}
