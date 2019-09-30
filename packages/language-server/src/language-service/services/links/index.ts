import * as Parser from "../../parser/json"
import { YAMLDocument } from "./../../parser/index"

import { Range, TextDocument, DocumentLink } from "vscode-languageserver-types"

export const findDocumentLinks = (
	document: TextDocument,
	yamlDocument: YAMLDocument
): DocumentLink[] => {
	const { root } = yamlDocument
	const links: DocumentLink[] = []

	const collectLinks = (node: Parser.ASTNode) => {
		if (node instanceof Parser.ExternalImportASTNode) {
			const uri = node.getUri()

			if (uri) {
				links.push(
					DocumentLink.create(
						Range.create(
							document.positionAt(node.start),
							document.positionAt(node.end)
						),
						uri
					)
				)
			}
		} else {
			node.getChildNodes().forEach(collectLinks)
		}
	}

	if (root) {
		collectLinks(root)

		yamlDocument.collectSubStacks().forEach(subStack => {
			if (subStack.uri) {
				links.push(
					DocumentLink.create(
						Range.create(
							document.positionAt(subStack.templateUrlNode.start),
							document.positionAt(subStack.templateUrlNode.end)
						),
						subStack.uri
					)
				)
			}
		})
	}

	return links
}
