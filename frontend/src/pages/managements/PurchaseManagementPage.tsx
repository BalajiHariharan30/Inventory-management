import { DeleteFilled, EditFilled, DownloadOutlined } from '@ant-design/icons';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Flex, Modal, Pagination, Table, Space, Tooltip } from 'antd';
import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import {
  useDeletePurchaseMutation,
  useGetAllPurchasesQuery,
  useUpdatePurchaseMutation,
} from '../../redux/features/management/purchaseApi';
import { IPurchase } from '../../types/purchase.types';
import formatDate from '../../utils/formatDate';
import toastMessage from '../../lib/toastMessage';
import SearchInput from '../../components/SearchInput';
import CustomInput from '../../components/CustomInput';
import { exportToCSV, exportToJSON } from '../../utils/exportData';

const PurchaseManagementPage = () => {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const { data, isFetching } = useGetAllPurchasesQuery(query);

  const onChange: PaginationProps['onChange'] = (page) => {
    setQuery((prev) => ({ ...prev, page: page }));
  };

  const handleExportCSV = () => {
    if (!data?.data) return;
    const exportData = data.data.map((purchase: IPurchase) => ({
      'Purchase ID': purchase._id,
      'Seller Name': purchase.sellerName,
      'Product Name': purchase.productName,
      'Unit Price': purchase.unitPrice,
      'Quantity': purchase.quantity,
      'Total Price': purchase.totalPrice,
      'Paid Amount': purchase.paid,
      'Due Amount': purchase.totalPrice - purchase.paid,
      'Purchase Date': formatDate(purchase.createdAt),
    }));
    exportToCSV(exportData, 'purchase_records');
  };

  const handleExportJSON = () => {
    if (!data?.data) return;
    exportToJSON(data.data, 'purchase_records');
  };

  const tableData = data?.data?.map((purchase: IPurchase) => ({
    key: purchase._id,
    sellerName: purchase.sellerName,
    productName: purchase.productName,
    price: purchase.unitPrice,
    quantity: purchase.quantity,
    totalPrice: purchase.totalPrice,
    due: purchase.totalPrice - purchase.paid,
    paid: purchase.paid,
    date: formatDate(purchase.createdAt),
  }));

  const columns: TableColumnsType<any> = [
    {
      title: 'Seller Name',
      key: 'sellerName',
      dataIndex: 'sellerName',
    },
    {
      title: 'Product Name',
      key: 'productName',
      dataIndex: 'productName',
    },
    {
      title: 'Price(per unit)',
      key: 'price',
      dataIndex: 'price',
      align: 'center',
      render: (price: number) => `₹${price.toLocaleString('en-IN')}`,
    },
    {
      title: 'Quantity',
      key: 'quantity',
      dataIndex: 'quantity',
      align: 'center',
    },
    {
      title: 'Total Price',
      key: 'totalPrice',
      dataIndex: 'totalPrice',
      align: 'center',
      render: (total: number) => `₹${total.toLocaleString('en-IN')}`,
    },
    {
      title: 'Due',
      key: 'due',
      dataIndex: 'due',
      align: 'center',
      render: (due: number) => (
        <span style={{ color: due > 0 ? 'var(--danger)' : 'var(--accent)', fontWeight: 600 }}>
          ₹{due.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      title: 'Date',
      key: 'date',
      dataIndex: 'date',
      align: 'center',
    },
    {
      title: 'Action',
      key: 'x',
      align: 'center',
      render: (item) => {
        return (
          <Space size="small">
            <UpdateModal purchase={item} />
            <DeleteModal id={item.key} />
          </Space>
        );
      },
      width: '1%',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Flex justify='space-between' align='center' style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-title)' }}>Purchases Log</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Monitor warehouse restock operations and dues.</p>
        </div>
        <Flex gap={8} style={{ flexWrap: 'wrap' }}>
          <Button onClick={handleExportCSV} type="default" icon={<DownloadOutlined />}>
            Export CSV
          </Button>
          <Button onClick={handleExportJSON} type="default">
            Export JSON
          </Button>
          <SearchInput setQuery={setQuery} placeholder='Search Purchase...' />
        </Flex>
      </Flex>
      <div className="custom-table-container">
        <Table
          size='middle'
          loading={isFetching}
          columns={columns}
          dataSource={tableData}
          pagination={false}
          className="custom-table"
        />
      </div>
      <Flex justify='center' style={{ marginTop: '1rem' }}>
        <Pagination
          current={query.page}
          onChange={onChange}
          defaultPageSize={query.limit}
          total={data?.meta?.total}
        />
      </Flex>
    </div>
  );
};

/**
 * Update Modal (Edit Purchase)
 */
const UpdateModal = ({ purchase }: { purchase: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatePurchase] = useUpdatePurchaseMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      sellerName: purchase.sellerName,
      productName: purchase.productName,
      quantity: purchase.quantity,
      unitPrice: purchase.price,
      paid: purchase.paid,
    },
  });

  const onSubmit = async (data: FieldValues) => {
    const payload = {
      sellerName: data.sellerName,
      productName: data.productName,
      quantity: Number(data.quantity),
      unitPrice: Number(data.unitPrice),
      paid: Number(data.paid),
    };

    try {
      const res = await updatePurchase({ id: purchase.key, payload }).unwrap();
      if (res.statusCode === 200) {
        toastMessage({ icon: 'success', text: 'Purchase log updated successfully!' });
        setIsModalOpen(false);
      }
    } catch (error: any) {
      toastMessage({ icon: 'error', text: error.data?.message || 'Failed to update purchase details' });
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Tooltip title="Edit Purchase Log">
        <Button
          onClick={showModal}
          type='primary'
          className='table-btn-small'
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <EditFilled />
        </Button>
      </Tooltip>
      <Modal title='Update Purchase Log' open={isModalOpen} onCancel={handleCancel} footer={null}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '1rem' }}>
          <CustomInput
            name='sellerName'
            errors={errors}
            label='Seller Name'
            register={register}
            required={true}
          />
          <CustomInput
            name='productName'
            errors={errors}
            label='Product Name'
            register={register}
            required={true}
          />
          <CustomInput
            name='unitPrice'
            errors={errors}
            label='Unit Price'
            register={register}
            required={true}
            type='number'
          />
          <CustomInput
            name='quantity'
            errors={errors}
            label='Quantity'
            register={register}
            required={true}
            type='number'
          />
          <CustomInput
            name='paid'
            errors={errors}
            label='Amount Paid'
            register={register}
            required={true}
            type='number'
          />
          <Flex justify='center' style={{ marginTop: '1.5rem' }}>
            <Button htmlType='submit' type='primary' style={{ backgroundColor: 'var(--primary)' }}>
              Update Record
            </Button>
          </Flex>
        </form>
      </Modal>
    </>
  );
};

/**
 * Delete Modal
 */
const DeleteModal = ({ id }: { id: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletePurchase] = useDeletePurchaseMutation();

  const handleDelete = async (id: string) => {
    try {
      const res = await deletePurchase(id).unwrap();
      if (res.statusCode === 200) {
        toastMessage({ icon: 'success', text: res.message });
        handleCancel();
      }
    } catch (error: any) {
      handleCancel();
      toastMessage({ icon: 'error', text: error.data.message });
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Tooltip title="Delete Purchase Log">
        <Button
          onClick={showModal}
          type='primary'
          className='table-btn-small'
          style={{ backgroundColor: 'var(--danger)' }}
        >
          <DeleteFilled />
        </Button>
      </Tooltip>
      <Modal title='Confirm Deletion' open={isModalOpen} onCancel={handleCancel} footer={null}>
        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-title)' }}>Delete this purchase log?</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>You won't be able to revert this action.</p>
          <div
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}
          >
            <Button
              onClick={handleCancel}
              type='default'
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDelete(id)}
              type='primary'
              danger
            >
              Yes, Delete Log
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PurchaseManagementPage;
