/**
 * Application Use Cases: Actor
 * Export all actor-related use cases
 */

import { apiActorRepository } from "@/infrastructure/repositories/ApiActorRepository";
import { MatrixMapping } from "@/domain/value-objects/MatrixMapping";
import { GetAllActors } from "./GetAllActors";
import { CreateActor } from "./CreateActor";
import { UpdateActor } from "./UpdateActor";
import { DeleteActor } from "./DeleteActor";

// Initialize dependencies
const matrixMapping = new MatrixMapping();

// Export use case instances (using real API repository)
export const getAllActors = new GetAllActors(apiActorRepository);
export const createActor = new CreateActor(apiActorRepository, matrixMapping);
export const updateActor = new UpdateActor(apiActorRepository, matrixMapping);
export const deleteActor = new DeleteActor(apiActorRepository);

// Export use case classes for testing
export { GetAllActors, CreateActor, UpdateActor, DeleteActor };
