import { RelevantDocument } from "@/components/Chat/domain";
import { ElasticDocument } from "./elasticDto";
import { QueryResponse } from "@pinecone-database/pinecone";
import { TextMetadata } from "@/types/chat";

export function pineconeDtoToRelevantDocuments(pineconeDtos: QueryResponse<TextMetadata>) {
  const transformedDtos:RelevantDocument[] = [];

  for (const dto of pineconeDtos.matches) {
    transformedDtos.push({
      url: dto.metadata?.url || '',
      fileName: dto.metadata?.fileName || '',
      content: dto.metadata?.text || '',
    })
  }
  return transformedDtos;
}

export function elasticDtoToRelevantDocuments(elasticDtos: ElasticDocument[]) {
  const transformedDtos:RelevantDocument[] = [];
  for (const dto of elasticDtos) {
    transformedDtos.push({
      url: dto.url,
      fileName: dto.title,
      content: dto.abstract,
    })
  }
  return transformedDtos;
}