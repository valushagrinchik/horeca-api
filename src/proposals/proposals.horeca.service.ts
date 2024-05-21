import { Injectable } from "@nestjs/common";
import { CreateProposalHorecaDto } from "./dto/create-proposal.horeca.dto";

@Injectable()
export class ProposalsHorecaService {
    create (dto: CreateProposalHorecaDto) {}
}