import { DeleteFilled, EditFilled, FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Flex, Modal, Pagination, Table, Space, Tooltip } from 'antd';
import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import SearchInput from '../../components/SearchInput';
import CustomInput from '../../components/CustomInput';
import toastMessage from '../../lib/toastMessage';
import {
  useDeleteSaleMutation,
  useGetAllSaleQuery,
  useUpdateSaleMutation,
} from '../../redux/features/management/saleApi';
import { ITableSale } from '../../types/sale.type';
import formatDate from '../../utils/formatDate';
import { exportToCSV, exportToJSON } from '../../utils/exportData';

const SaleManagementPage = () => {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const { data, isFetching } = useGetAllSaleQuery(query);

  const onChange: PaginationProps['onChange'] = (page) => {
    setQuery((prev) => ({ ...prev, page: page }));
  };

  const handleExportCSV = () => {
    if (!data?.data) return;
    const exportData = data.data.map((sale: ITableSale) => ({
      'Sale ID': sale._id,
      'Product Name': sale.productName,
      'Product Price': sale.productPrice,
      'Buyer Name': sale.buyerName,
      'Quantity': sale.quantity,
      'Total Price': sale.totalPrice,
      'Selling Date': formatDate(sale.date),
    }));
    exportToCSV(exportData, 'sales_history');
  };

  const handleExportJSON = () => {
    if (!data?.data) return;
    exportToJSON(data.data, 'sales_history');
  };

  const tableData = data?.data?.map((sale: ITableSale) => ({
    key: sale._id,
    productName: sale.productName,
    productPrice: sale.productPrice,
    buyerName: sale.buyerName,
    quantity: sale.quantity,
    totalPrice: sale.totalPrice,
    date: formatDate(sale.date),
    rawDate: sale.date,
  }));

  const columns: TableColumnsType<any> = [
    {
      title: 'Product Name',
      key: 'productName',
      dataIndex: 'productName',
    },
    {
      title: 'Product Price',
      key: 'productPrice',
      dataIndex: 'productPrice',
      align: 'center',
      render: (price: number) => `₹${price.toLocaleString('en-IN')}`,
    },
    {
      title: 'Buyer Name',
      key: 'buyerName',
      dataIndex: 'buyerName',
      align: 'center',
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
      title: 'Selling Date',
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
            <InvoiceModal sale={item} />
            <UpdateModal sale={item} />
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-title)' }}>Sales History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Track, modify, and review product sales.</p>
        </div>
        <Flex gap={8} style={{ flexWrap: 'wrap' }}>
          <Button onClick={handleExportCSV} type="default" icon={<DownloadOutlined />}>
            Export CSV
          </Button>
          <Button onClick={handleExportJSON} type="default">
            Export JSON
          </Button>
          <SearchInput setQuery={setQuery} placeholder='Search Sold Products...' />
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
 * Update Modal (Edit Sale)
 */
const UpdateModal = ({ sale }: { sale: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateSale] = useUpdateSaleMutation();

  const formattedDate = sale.rawDate
    ? new Date(sale.rawDate).toISOString().split('T')[0]
    : '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      buyerName: sale.buyerName,
      quantity: sale.quantity,
      price: sale.productPrice,
      date: formattedDate,
    },
  });

  const onSubmit = async (data: FieldValues) => {
    const payload = {
      buyerName: data.buyerName,
      quantity: Number(data.quantity),
      price: Number(data.price),
      date: data.date,
    };

    try {
      const res = await updateSale({ id: sale.key, payload }).unwrap();
      if (res.statusCode === 200) {
        toastMessage({ icon: 'success', text: 'Sale log updated successfully!' });
        setIsModalOpen(false);
      }
    } catch (error: any) {
      toastMessage({ icon: 'error', text: error.data?.message || 'Failed to update sale' });
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
      <Tooltip title="Edit Transaction">
        <Button
          onClick={showModal}
          type='primary'
          className='table-btn-small'
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <EditFilled />
        </Button>
      </Tooltip>
      <Modal title='Update Sale Details' open={isModalOpen} onCancel={handleCancel} footer={null}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '1rem' }}>
          <CustomInput
            name='buyerName'
            errors={errors}
            label='Buyer Name'
            register={register}
            required={true}
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
            name='price'
            errors={errors}
            label='Unit Price'
            register={register}
            required={true}
            type='number'
          />
          <CustomInput
            name='date'
            errors={errors}
            label='Selling Date'
            register={register}
            required={true}
            type='date'
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
 * Invoice Modal (Receipt Printout Viewer)
 */
const InvoiceModal = ({ sale }: { sale: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePrint = () => {
    const printContent = document.getElementById(`invoice-print-${sale.key}`);
    const printWindow = window.open('about:blank', '_blank', 'left=200,top=200,width=800,height=600');
    
    if (printWindow && printContent) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - #${sale.key.substring(sale.key.length - 8).toUpperCase()}</title>
            <style>
              body { 
                font-family: 'Courier New', Courier, monospace; 
                padding: 40px; 
                color: #000; 
                max-width: 450px;
                margin: 0 auto;
              }
              .text-center { text-align: center; }
              .dashed-line { border-bottom: 2px dashed #000; margin: 15px 0; }
              .flex-between { display: flex; justify-content: space-between; margin-bottom: 8px; }
              .font-bold { font-weight: bold; }
              .header { margin-bottom: 20px; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  return (
    <>
      <Tooltip title="View Receipt">
        <Button
          onClick={() => setIsModalOpen(true)}
          type='default'
          className='table-btn-small'
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <FileTextOutlined />
        </Button>
      </Tooltip>
      <Modal
        title="View Receipt"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
          <Button key="print" type="primary" onClick={handlePrint} style={{ backgroundColor: 'var(--primary)' }}>
            Print Receipt
          </Button>,
        ]}
      >
        <div id={`invoice-print-${sale.key}`} className="invoice-card" style={{ marginTop: '1rem' }}>
          <div className="invoice-header">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#0f172a' }}>STOCKFLOW CORP</h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>WAREHOUSE & INVENTORY LOGS</p>
          </div>
          <div className="invoice-body">
            <div className="invoice-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>Receipt No:</span>
              <span style={{ fontWeight: 600 }}>#${sale.key.substring(sale.key.length - 8).toUpperCase()}</span>
            </div>
            <div className="invoice-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>Date:</span>
              <span>${sale.date}</span>
            </div>
            <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '0.75rem 0' }}></div>
            <div className="invoice-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>Customer:</span>
              <span style={{ fontWeight: 600 }}>${sale.buyerName}</span>
            </div>
            <div className="invoice-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>Product:</span>
              <span style={{ fontWeight: 600 }}>${sale.productName}</span>
            </div>
            <div className="invoice-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>Quantity:</span>
              <span>${sale.quantity} units</span>
            </div>
            <div className="invoice-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>Unit Price:</span>
              <span>₹${sale.productPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div style={{ borderBottom: '2px dashed #0f172a', margin: '1rem 0' }}></div>
          <div className="invoice-total" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
            <span>TOTAL PAID:</span>
            <span>₹${sale.totalPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </Modal>
    </>
  );
};

/**
 * Delete Modal
 */
const DeleteModal = ({ id }: { id: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteSale] = useDeleteSaleMutation();

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteSale(id).unwrap();
      if (res.statusCode === 200) {
        toastMessage({ icon: 'success', text: 'Sale transaction deleted and stock restored!' });
        handleCancel();
      }
    } catch (error: any) {
      handleCancel();
      toastMessage({ icon: 'error', text: error.data?.message || 'Failed to delete sale log' });
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
      <Tooltip title="Delete Transaction">
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
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-title)' }}>Delete this sale transaction?</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Warning: The product stock level will be automatically restored by the transaction amount.
          </p>
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
              Yes, Delete Transaction
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SaleManagementPage;
