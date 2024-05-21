import { Injectable } from "@nestjs/common";
import { CreateProposalProviderDto } from "./dto/create-proposal.provider.dto";

@Injectable()
export class ProposalsProviderService {
    create (dto: CreateProposalProviderDto) {}
}