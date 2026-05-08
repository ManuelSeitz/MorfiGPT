import { Ingredient } from "@repo/types/recipes";
import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(["title", "author"])
export class Recipe {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar")
  title: string;

  @Column("varchar")
  description: string;

  @Column("varchar")
  author: string;

  @Column("varchar", { nullable: true })
  category: string | null;

  @Column("integer", { nullable: true })
  estimatedTime: number | null;

  @Column("jsonb")
  ingredients: Ingredient[];

  @Column("text", { array: true })
  instructions: string[];

  @Column("float", { nullable: true })
  estimatedPrice: number | null;

  @Column("integer")
  servings: number;

  @Column("varchar", { nullable: true })
  difficulty: string | null;

  @Column("vector", { length: 1024, select: false, nullable: true })
  recipeEmbedding: number[] | null;

  @Column("vector", { length: 1024, select: false, nullable: true })
  ingredientsEmbedding: number[] | null;

  @Column("varchar")
  link: string;
}
