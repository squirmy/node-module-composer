import type { ConditionalKeys, EmptyObject, Simplify, UnionToIntersection, UnknownRecord } from 'type-fest';

interface CoreOptions {
    depth: number
    overrides: object
    customiser: string
    configAlias: string
    freezeConfig: boolean
    extensions: boolean
}

interface ExtensionOptions {
    globalThis: object
    publicPrefix: string
    privatePrefix: string
    functionAlias: object
    moduleAlias: string[]
}

type Options = CoreOptions & ExtensionOptions

type ComposerOptionsConfig = object | object[]
interface ComposerOptions {
    config?: ComposerOptionsConfig
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Composed = (...args: any[]) => any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetupComposable = { setup: (deps: any) => Composed }
type Composable = (deps: Modules) => Composed
type ModuleFunction = Composable | Composed

type Module<T = UnknownRecord> = {
    [K in keyof T]: T[K] extends ModuleFunction
    ? ModuleFunction
    : Module<T[K]>
}

type Modules = Record<PropertyKey, Module | unknown>

type ValuesOf<T> = T[keyof T]
type ModuleValuesOf<T> = Extract<ValuesOf<T>, Module>

type AllowedMaxDepth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
type IncrementDepth<N extends number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10][N]

type ComposeEach<T extends Module, MaxDepth extends AllowedMaxDepth, N extends number> = {
    [K in keyof T]:
    N extends MaxDepth
    ? T[K]
    : T[K] extends ModuleFunction
    ? ReturnType<T[K]>
    : ComposeEach<T[K], MaxDepth, IncrementDepth<N>>
}

export type SelfOf<T> = Omit<ComposeEach<ModuleValuesOf<T>, 1, 0>, 'setup'>
export type SelfNameOf<T> = keyof T
export type SpecifiedDepsOf<T, Composed> = Exclude<keyof Composed, SelfNameOf<T>> | never
export type InjectOf<T, Composed, K extends SpecifiedDepsOf<T, Composed>> = 
  Composed extends { config: unknown }
  ? Pick<Omit<Composed, SelfNameOf<T>>, | K> & Record<'self' | SelfNameOf<T>, SelfOf<T>> & Record<'config', Composed['config']>
  : Pick<Omit<Composed, SelfNameOf<T>>, | K> & Record<'self' | SelfNameOf<T>, SelfOf<T>>

type ComposeType = 'Single' | 'Flat'
export type ComposedModule<T extends Module, CT extends ComposeType = 'Single'> = Simplify<
  CT extends 'Single' 
  ? ComposeEach<T, 1, 0>
  : ComposeEach<T, 10, 0>
>

type SetupModule<T extends SetupComposable> = ReturnType<ReturnType<T['setup']>>

export type ComposedOrSetupModule<T extends Module, CT extends ComposeType = 'Single'> = Simplify<
    T extends SetupComposable
    ? SetupModule<T>
    : ComposedModule<T, CT>
>

type ModuleParameters<T extends Module, Key = keyof T> =
    Key extends PropertyKey
    ? T[Key] extends ModuleFunction
    ? Parameters<T[Key]>[0]
    : ModuleParameters<T[Key]>
    : never

type ModuleDependencies<T extends Module, C extends ComposerOptions> =
    C['config'] extends ComposerOptionsConfig
    ? Omit<UnionToIntersection<NonNullable<ModuleParameters<T>>>, 'config'>
    : UnionToIntersection<NonNullable<ModuleParameters<T>>>

type Deps<T extends Modules, Path extends keyof T, C extends ComposerOptions> = Omit<ModuleDependencies<ModulePath<T, Path>, C>, Path | 'self'>
type ComposeResult<T extends Modules, Path extends keyof T, CT extends ComposeType> = Record<Path, ComposedOrSetupModule<ModulePath<T, Path>, CT>>

type ModuleKeys<T> = ConditionalKeys<T, Module>
type ModulePath<T, Path extends keyof T> = T extends Module ? T[Path] : never

type Compose<T extends Modules, C extends ComposerOptions> = <Path extends ModuleKeys<T>>(
    path: Path,
    ...args: Deps<T, Path, C> extends EmptyObject ? [Deps<T, Path, C>?, Partial<Options>?] : [Deps<T, Path, C>, Partial<Options>?]
) => ComposeResult<T, Path, 'Single'>

type DeepCompose<T extends Modules, C extends ComposerOptions> = <Path extends ModuleKeys<T>>(
    path: Path,
    ...args: Deps<T, Path, C> extends EmptyObject ? [Deps<T, Path, C>?, Partial<Options>?] : [Deps<T, Path, C>, Partial<Options>?]
) => ComposeResult<T, Path, 'Flat'>

interface Asis<T extends Modules> {
    asis<Path extends keyof T>(path: Path, opts?: Partial<Options>): Record<Path, T[Path]>
}

interface Deep<T extends Modules, C extends ComposerOptions> {
    deep: DeepCompose<T, C>
}

interface Target<T> {
    target: T
}

interface Composer<T extends Modules, C extends ComposerOptions> {
    compose: Target<T> & Compose<T, C> & Asis<T> & Deep<T, C>
}

declare function composer<T extends Modules, C extends ComposerOptions>(target: T, config?: C): Composer<T, C>

export default composer;
