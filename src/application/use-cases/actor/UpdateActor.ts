/**
 * Application Use Case: Update Actor
 */

import { Actor, UpdateActorDto } from "@/domain/entities/Actor";
import { ActorRepository } from "@/domain/repositories/ActorRepository";
import { MatrixMapping } from "@/domain/value-objects/MatrixMapping";

export class UpdateActor {
  constructor(
    private repository: ActorRepository,
    private matrixMapping: MatrixMapping
  ) {}

  async execute(data: UpdateActorDto, userId: number): Promise<Actor> {
    // Recalculate matrix values if relacion or nivelPoder changed
    const interes = data.relacion 
      ? this.matrixMapping.mapRelacionToInteres(data.relacion)
      : undefined;
    const poder = data.nivelPoder
      ? this.matrixMapping.mapPoderToValue(data.nivelPoder)
      : undefined;

    const updateData: UpdateActorDto = {
      ...data,
    };

    const actor = await this.repository.update(updateData, userId);

    // Add calculated values if they exist
    return {
      ...actor,
      ...(interes !== undefined && { interes }),
      ...(poder !== undefined && { poder }),
    };
  }
}
