import { ElasticDocument } from "./elasticDto";
import { QueryResponse } from "@pinecone-database/pinecone";
import { TextMetadata } from "@/types/chat";
import { RelevantDocument } from "../../types/relevant-document.d.ts";

export function globalSearchAPIDtoToRelevantDocuments(pineconeDtos: any[]) {
  const hashMap = [];
  const transformedDtos:RelevantDocument[] = [];

  for (const dto of pineconeDtos) {
    //@ts-ignore
    if(dto?.fileName in hashMap) 
      continue

    //@ts-ignore
    hashMap[dto?.fileName] = dto?.fileName;

    transformedDtos.push({
      url: dto.url || '',
      fileName: dto.fileName || '',
      content: dto.text || '',
    })
  }
  return transformedDtos;
}

export function pineconeDtoToRelevantDocuments(pineconeDtos: QueryResponse<TextMetadata>) {
  const hashMap = {}
  const transformedDtos:RelevantDocument[] = [];

  for (const dto of pineconeDtos.matches) {
    //@ts-ignore
    if(dto.metadata?.fileName in hashMap) 
      continue

    //@ts-ignore
    hashMap[dto.metadata?.fileName] = dto.metadata?.fileName;
    transformedDtos.push({
      url: dto.metadata?.url || '',
      fileName: dto.metadata?.fileName || '',
      content: dto.metadata?.text || '',
    })
  }

  return transformedDtos;
}

export function elasticDtoToRelevantDocuments(elasticDtos: ElasticDocument[]) {
  const hashMap = [];
  const transformedDtos:RelevantDocument[] = [];

  for (const dto of elasticDtos) {
    //@ts-ignore
    if(dto?.title in hashMap) 
      continue

    //@ts-ignore
    hashMap[dto?.fileName] = dto?.fileName;

    transformedDtos.push({
      url: dto.url,
      fileName: dto.title,
      content: dto.abstract,
    })
  }
  return transformedDtos;
}