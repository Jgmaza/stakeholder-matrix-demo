/**
 * Application Use Case: Delete Actor
 */

import { ActorRepository } from "@/domain/repositories/ActorRepository";

export class DeleteActor {
  constructor(private repository: ActorRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
