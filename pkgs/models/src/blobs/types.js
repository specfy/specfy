export function isDocumentBlob(blob) {
    return blob.type === 'document';
}
export function isComponentBlob(blob) {
    return blob.type === 'component';
}
export function isProjectBlob(blob) {
    return blob.type === 'project';
}
