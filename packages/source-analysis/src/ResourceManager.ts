import path from "node:path";
import { logger } from "./logger";
import type {
  LocalFileResource,
  LocalFileResourceId,
  MiddlewareEntry,
  MiddlewareEntryId,
  ModuleReference,
  ModuleReferenceId,
  RouteEntry,
  RouteEntryId,
  RouteTree,
  RouteTreeEntry,
  RouteTreeEntryId,
  RouteTreeId,
  RouteTreeReference,
  SourceReference,
  SourceReferenceId,
  TreeResource,
  TreeResourceId,
} from "./types";

// Class that manages tree resources
export class ResourceManager {
  private references: Map<TreeResourceId, TreeResource>;
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.references = new Map();
  }

  public asRelativePath(absolutePath: string) {
    return path.isAbsolute(absolutePath)
      ? path.relative(this.projectRoot, absolutePath)
      : absolutePath;
  }

  public asAbsolutePath(relativePath: string) {
    return path.isAbsolute(relativePath)
      ? relativePath
      : path.join(this.projectRoot, relativePath);
  }

  // Overloads for getId function
  public getId(
    resourceType: "ROUTE_TREE",
    fileName: string,
    position: number,
  ): RouteTree["id"];
  public getId(
    resourceType: "ROUTE_ENTRY",
    fileName: string,
    position: number,
  ): RouteEntry["id"];
  public getId(
    resourceType: "MIDDLEWARE_ENTRY",
    fileName: string,
    position: number,
  ): MiddlewareEntry["id"];
  public getId(
    resourceType: "SOURCE_REFERENCE",
    fileName: string,
    position: number,
  ): SourceReference["id"];
  public getId(
    resourceType: "MODULE_REFERENCE",
    importPath: string,
    importName: string,
  ): ModuleReference["id"];
  public getId(
    resourceType: "ROUTE_TREE_REFERENCE",
    fileName: string,
    position: number,
  ): RouteTreeReference["id"];
  // Implementation of getId function
  public getId(
    resourceType: TreeResource["type"],
    fileNameOrImportPath: string,
    positionOrImportName: string | number,
  ): TreeResourceId {
    if (resourceType === "MODULE_REFERENCE") {
      const importPath = encodeURIComponent(fileNameOrImportPath);
      const importName = encodeURIComponent(positionOrImportName as string);
      return `${resourceType}:${importPath}@${importName}` as ModuleReference["id"];
    }

    const fileName = encodeURIComponent(
      this.asRelativePath(fileNameOrImportPath),
    );
    const position = positionOrImportName as number;
    return `${resourceType}:${fileName}@${position}` as TreeResourceId;
  }

  public decodeId(id: TreeResourceId) {
    const parts = id.split(":");
    const type = parts[0] as TreeResource["type"];
    const [fileName = "", position = ""] = (parts[1] ?? "").split("@");
    return {
      type,
      fileName: this.asAbsolutePath(decodeURIComponent(fileName)),
      position: Number(position),
    };
  }

  createRouteTree(props: Omit<RouteTree, "id">): RouteTree {
    const fileName = this.asRelativePath(props.fileName);
    const id = this.getId(props.type, fileName, props.position);

    if (this.references.has(id)) {
      logger.warn("Resource already exists", id);
    }

    const resource = { id, ...props, fileName };
    this.references.set(id, resource);
    return resource;
  }

  public createRouteEntry(props: Omit<RouteEntry, "id">): RouteEntry {
    const fileName = this.asRelativePath(props.fileName);
    const id = this.getId(props.type, fileName, props.position);

    if (this.references.has(id)) {
      logger.warn("Resource already exists", id);
    }

    const resource = { id, ...props, fileName };
    this.references.set(id, resource);
    return resource;
  }

  private addResource(resource: TreeResource) {
    this.references.set(resource.id, resource);
  }

  public createMiddlewareEntry(
    props: Omit<MiddlewareEntry, "id">,
  ): MiddlewareEntry {
    const fileName = this.asRelativePath(props.fileName);
    const id = this.getId(props.type, fileName, props.position);

    if (this.references.has(id)) {
      logger.warn("Resource already exists", id);
    }

    const resource = { id, ...props, fileName };
    this.references.set(id, resource);
    return resource;
  }

  public createSourceReference(
    props: Omit<SourceReference, "id">,
  ): SourceReference {
    const fileName = this.asRelativePath(props.fileName);
    const id = this.getId(props.type, fileName, props.position);

    if (this.references.has(id)) {
      logger.warn("Resource already exists", id);
    }

    const resource = { id, ...props, fileName };
    this.references.set(id, resource);
    return resource;
  }

  public createModuleReference(
    props: Omit<ModuleReference, "id">,
  ): ModuleReference {
    const id = this.getId(props.type, props.pathId, props.import);
    if (this.references.has(id)) {
      logger.warn("Resource already exists", id);
    }

    const resource = { id, ...props };
    this.references.set(id, resource);
    return resource;
  }

  public createRouteTreeReference(
    props: Omit<RouteTreeReference, "id">,
  ): RouteTreeReference {
    const fileName = this.asRelativePath(props.fileName);
    const id = this.getId(props.type, fileName, props.position);

    if (this.references.has(id)) {
      logger.warn("Resource already exis1", id);
    }

    const resource = { id, ...props, fileName };
    this.references.set(id, resource);
    return resource;
  }

  // Overloaded getResource function
  public getResource(id: RouteTreeId): RouteTree | undefined;
  public getResource(id: RouteEntryId): RouteEntry | undefined;
  public getResource(id: RouteTreeEntryId): RouteTreeEntry | undefined;
  public getResource(id: MiddlewareEntryId): MiddlewareEntry | undefined;
  public getResource(id: SourceReferenceId): SourceReference | undefined;
  public getResource(id: ModuleReferenceId): ModuleReference | undefined;
  public getResource(
    id: RouteTreeEntryId | RouteTreeId,
  ): RouteTreeEntry | RouteTree | undefined;
  public getResource(id: LocalFileResourceId): LocalFileResource | undefined;
  // Actual implementation
  public getResource(id: TreeResourceId): TreeResource | undefined {
    return this.references.get(id);
  }

  public removeResource(id: TreeResourceId) {
    this.references.delete(id);
  }

  /**
   * @param module
   * @param sourceReferenceFileName The file name of the related source reference
   * @param sourceReferencePosition The position in the that file where the reference is located
   */
  public addModuleToSourceReference(
    module: ModuleReference,
    sourceReferenceFileName: string,
    sourceReferencePosition: number,
  ): void {
    const id = this.getId(
      "SOURCE_REFERENCE",
      sourceReferenceFileName,
      sourceReferencePosition,
    );
    const sourceReference = this.getResource(id) as SourceReference;

    if (!this.references.has(module.id)) {
      this.addResource(module);
    }

    if (!sourceReference) {
      logger.error(
        `Missing SourceReference for (fileName: ${sourceReferenceFileName}, position: ${sourceReferencePosition}, id: ${id}`,
      );
      throw new Error(
        "Missing source reference. Attempting to add a module to a non-existing reference",
      );
    }

    sourceReference.modules.add(module.id);
  }

  public clearResources(): void {
    this.references.clear();
  }

  public getResources() {
    return Object.fromEntries(this.references);
  }
}
