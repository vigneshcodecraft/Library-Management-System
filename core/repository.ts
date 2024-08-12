import { IPageRequest, IPagedResponse } from './pagination.response';

export interface IRepository<
  MutationModel,
  CompleteModel extends MutationModel
> {
  create(data: MutationModel): Promise<CompleteModel>;
  update(id: number, data: MutationModel): Promise<CompleteModel | null>;
  delete(id: number): Promise<CompleteModel | null>;
  getById(id: number): Promise<CompleteModel | null>;
  list(params: IPageRequest): Promise<IPagedResponse<CompleteModel>>;
}

export interface ITransactionRepository<
  MutationModel,
  CompleteModel extends MutationModel
> {
  create(data: MutationModel): Promise<CompleteModel>;
  update(
    transactionId: number,
    returnDate: string
  ): Promise<CompleteModel | null>;
}
