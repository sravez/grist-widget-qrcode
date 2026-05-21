import { ColumnsToMap, CustomSectionAPI, InteractionOptions, InteractionOptionsRequest, WidgetColumnMap } from "app/plugin/CustomSectionAPI";
import { AccessTokenOptions, AccessTokenResult, FetchSelectedOptions, GristAPI, GristDocAPI, GristView } from "app/plugin/GristAPI";
import { RowRecord } from "app/plugin/GristData";
import { RenderOptions } from "app/plugin/RenderOptions";
import { TableOperations } from "app/plugin/TableOperations";
import { WidgetAPI } from "app/plugin/WidgetAPI";
export * from "app/plugin/TypeCheckers";
export * from "app/plugin/FileParserAPI";
export * from "app/plugin/GristAPI";
export * from "app/plugin/GristData";
export * from "app/plugin/GristTable";
export * from "app/plugin/ImportSourceAPI";
export * from "app/plugin/StorageAPI";
export * from "app/plugin/RenderOptions";
export * from "app/plugin/WidgetAPI";
export * from "app/plugin/CustomSectionAPI";
export { decodeObject, mapValues } from "app/plugin/objtypes";
import { Rpc } from "grain-rpc";
export declare const rpc: Rpc;
export declare const api: GristAPI;
export declare const coreDocApi: GristDocAPI;
/**
 * Interface for the records backing a custom widget.
 */
export declare const viewApi: GristView;
/**
 * Interface for the state of a custom widget.
 */
export declare const widgetApi: WidgetAPI;
/**
 * Interface for the mapping of a custom widget.
 */
export declare const sectionApi: CustomSectionAPI;
export declare const commandApi: any;
/**
 * Shortcut for {@link GristView.allowSelectBy}.
 */
export declare const allowSelectBy: () => Promise<void>;
/**
 * Shortcut for {@link GristView.setSelectedRows}.
 */
export declare const setSelectedRows: (rowIds: number[] | null) => Promise<void>;
/**
 * Sets the cursor position in a linked section.
 */
export declare const setCursorPos: (pos: import("app/plugin/GristAPI").CursorPos) => Promise<void>;
/**
 * Same as {@link GristView.fetchSelectedTable | GristView.fetchSelectedTable},
 * but the option `keepEncoded` is `false` by default.
 */
export declare function fetchSelectedTable(options?: FetchSelectedOptions): Promise<any>;
/**
 * Same as {@link GristView.fetchSelectedRecord | GristView.fetchSelectedRecord},
 * but the option `keepEncoded` is `false` by default.
 */
export declare function fetchSelectedRecord(rowId: number, options?: FetchSelectedOptions): Promise<any>;
/**
 * A collection of methods for fetching document data. The
 * fetchSelectedTable and fetchSelectedRecord methods are
 * overridden to decode data by default.
 */
export declare const docApi: GristDocAPI & GristView;
export declare const on: <K>(eventName: string | symbol, listener: (...args: any[]) => void) => Rpc;
/**
 * Shortcut for {@link WidgetAPI.getOption}
 */
export declare const getOption: (key: string) => Promise<any>;
/**
 * Shortcut for {@link WidgetAPI.setOption}
 */
export declare const setOption: (key: string, value: any) => Promise<void>;
/**
 * Shortcut for {@link WidgetAPI.setOptions}
 */
export declare const setOptions: (options: {
    [key: string]: any;
}) => Promise<void>;
/**
 * Shortcut for {@link WidgetAPI.getOptions}
 */
export declare const getOptions: () => Promise<object | null>;
/**
 * Shortcut for {@link WidgetAPI.clearOptions}
 */
export declare const clearOptions: () => Promise<void>;
/**
 * Get access to a table in the document. If no tableId specified, this
 * will use the current selected table (for custom widgets).
 * If a table does not exist, there will be no error until an operation
 * on the table is attempted.
 */
export declare function getTable(tableId?: string): TableOperations;
/**
 * Get an access token, for making API calls outside of the custom widget
 * API. There is no caching of tokens. The returned token can
 * be used to authorize regular REST API calls that access the content of the
 * document. For example, in a custom widget for a table with a `Photos` column
 * containing attachments, the following code will update the `src` of an
 * image with id `the_image` to show the attachment:
 * ```js
 * grist.onRecord(async (record) => {
 *   const tokenInfo = await grist.docApi.getAccessToken({readOnly: true});
 *   const img = document.getElementById('the_image');
 *   const id = record.Photos[0];  // get an id of an attachment - there could be several
 *                                 // in a cell, for this example we just take the first.
 *   const src = `${tokenInfo.baseUrl}/attachments/${id}/download?auth=${tokenInfo.token}`;
 *   img.setAttribute('src', src);
 * });
 * ```
 */
export declare function getAccessToken(options?: AccessTokenOptions): Promise<AccessTokenResult>;
/**
 * Get the current selected table (for custom widgets).
 */
export declare const selectedTable: TableOperations;
export declare function getSelectedTableId(): Promise<string>;
export declare function getSelectedTableIdSync(): string | undefined;
/**
 * Used by tests to wait for all pending requests to settle.
 *
 * TODO: currently only waits for requests for mappings.
 *
 * @internal
 */
export declare function testWaitForPendingRequests(): Promise<void | null>;
/**
 * Renames columns in the result using columns mapping configuration passed in ready method.
 * Returns null if not all required columns were mapped or not widget doesn't support
 * custom column mapping.
 */
export declare function mapColumnNames(data: any, options?: {
    columns?: ColumnsToMap;
    mappings?: WidgetColumnMap | null;
    reverse?: boolean;
}): any;
/**
 * Offer a convenient way to map data with renamed columns back into the
 * form used in the original table. This is useful for making edits to the
 * original table in a widget with column mappings. As for mapColumnNames(),
 * we don't attempt to do these transformations automatically.
 */
export declare function mapColumnNamesBack(data: any, options?: {
    columns?: ColumnsToMap;
    mappings?: WidgetColumnMap | null;
}): any;
/**
 * For custom widgets, add a handler that will be called whenever the
 * row with the cursor changes - either by switching to a different row, or
 * by some value within the row potentially changing.  Handler may
 * in the future be called with null if the cursor moves away from
 * any row.
 * By default, `options.keepEncoded` is `false`.
 */
export declare function onRecord(callback: (data: RowRecord | null, mappings: WidgetColumnMap | null) => unknown, options?: FetchSelectedOptions): void;
/**
 * For custom widgets, add a handler that will be called whenever the
 * new (blank) row is selected.
 */
export declare function onNewRecord(callback: (mappings: WidgetColumnMap | null) => unknown): void;
/**
 * For custom widgets, add a handler that will be called whenever the
 * selected records change.
 * By default, `options.format` is `'rows'` and `options.keepEncoded` is `false`.
 */
export declare function onRecords(callback: (data: RowRecord[], mappings: WidgetColumnMap | null) => unknown, options?: FetchSelectedOptions): void;
/**
 * For custom widgets, add a handler that will be called whenever the
 * widget options change (and on initial ready message). Handler will be
 * called with an object containing saved json options, or null if no options were saved.
 * The second parameter has information about the widgets relationship with
 * the document that contains it.
 */
export declare function onOptions(callback: (options: any, settings: InteractionOptions) => unknown): void;
/**
 * Calling `addImporter(...)` adds a safeBrowser importer. It is a short-hand for forwarding calls
 * to an `ImportSourceAPI` implementation registered in the file at `path`. It takes care of
 * creating the stub, registering an implementation that renders the file, forward the call and
 * dispose the view properly. If `mode` is `'inline'` embeds the view in the import modal, otherwise
 * renders fullscreen.
 *
 * Notes: it assumes that file at `path` registers an `ImportSourceAPI` implementation under
 * `name`. Calling `addImporter(...)` from another component than a `safeBrowser` component is not
 * currently supported.
 *
 * @internal
 */
export declare function addImporter(name: string, path: string, mode: "fullscreen" | "inline", options?: RenderOptions): Promise<void>;
export declare function enableKeyboardShortcuts(): void;
/**
 * Options when initializing connection to Grist.
 */
export interface ReadyPayload extends Omit<InteractionOptionsRequest, "hasCustomOptions"> {
    /**
     * Handler that will be called by Grist to open additional configuration panel inside the Custom Widget.
     */
    onEditOptions?: () => unknown;
}
/**
 * Declare that a component is prepared to receive messages from the outside world.
 * Grist will not attempt to communicate with it until this method is called.
 */
export declare function ready(settings?: ReadyPayload): void;
