import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Trash2, Download, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Sale {
  id: string;
  productName: string;
  amount: number;
  quantity: number;
  total: number;
  timestamp: Date;
}

const Index = () => {
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('shopSales');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [productName, setProductName] = useState('');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('');
  const [nextReportTime, setNextReportTime] = useState<string>('');

  // Calculate next 10 PM report time
  useEffect(() => {
    const calculateNextReport = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(22, 0, 0, 0);
      
      if (now.getHours() >= 22) {
        next.setDate(next.getDate() + 1);
      }
      
      const timeUntil = next.getTime() - now.getTime();
      const hours = Math.floor(timeUntil / (1000 * 60 * 60));
      const mins = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
      
      setNextReportTime(`${hours}h ${mins}m`);
    };

    calculateNextReport();
    const interval = setInterval(calculateNextReport, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check for 10 PM and show report
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      if (now.getHours() === 22 && now.getMinutes() === 0) {
        showDailyReport();
      }
    };

    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [sales]);

  const addSale = () => {
    if (!productName.trim() || !amount || !quantity) {
      toast.error('Please fill all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    const quantityNum = parseFloat(quantity);

    if (amountNum <= 0 || quantityNum <= 0) {
      toast.error('Amount and quantity must be greater than 0');
      return;
    }

    const newSale: Sale = {
      id: Date.now().toString(),
      productName: productName.trim(),
      amount: amountNum,
      quantity: quantityNum,
      total: amountNum * quantityNum,
      timestamp: new Date(),
    };

    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    localStorage.setItem('shopSales', JSON.stringify(updatedSales));

    setProductName('');
    setAmount('');
    setQuantity('');
    toast.success(`${productName} added!`);
  };

  const deleteSale = (id: string) => {
    const updatedSales = sales.filter(s => s.id !== id);
    setSales(updatedSales);
    localStorage.setItem('shopSales', JSON.stringify(updatedSales));
    toast.success('Sale removed');
  };

  const showDailyReport = () => {
    const today = new Date().toLocaleDateString();
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const reportText = `
📊 DAILY CASH REPORT - ${today}
━━━━━━━━━━━━━━━━━━━━━━
Total Sales: ${sales.length}
Total Cash: ₹${totalSales.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━
    `;
    toast.success(reportText);
  };

  const downloadReport = () => {
    const today = new Date().toLocaleDateString();
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    
    let csv = 'Product Name,Amount,Quantity,Total,Time\n';
    sales.forEach(s => {
      csv += `${s.productName},${s.amount},${s.quantity},${s.total},${new Date(s.timestamp).toLocaleTimeString()}\n`;
    });
    csv += `\nTotal Sales: ${sales.length}\nTotal Cash: ₹${totalSales.toFixed(2)}`;

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    element.setAttribute('download', `sales_report_${today}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Report downloaded!');
  };

  const totalCash = sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Shop Manager</h1>
          <p className="text-muted-foreground">Track your daily sales and cash flow</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entry Form */}
          <Card className="lg:col-span-1 p-6 bg-card border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Add Sale</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Product Name
                </label>
                <Input
                  placeholder="e.g., Milk, Bread"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSale()}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Amount (₹)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSale()}
                  className="bg-background border-border text-foreground"
                  step="0.01"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Quantity
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSale()}
                  className="bg-background border-border text-foreground"
                  step="0.01"
                />
              </div>

              {/* Auto Calculator Display */}
              {amount && quantity && (
                <div className="bg-secondary p-3 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Total:</p>
                  <p className="text-2xl font-bold text-accent-foreground">
                    ₹{(parseFloat(amount) * parseFloat(quantity)).toFixed(2)}
                  </p>
                </div>
              )}

              <Button 
                onClick={addSale}
                className="w-full bg-primary text-primary-foreground hover:opacity-90"
              >
                Add Sale
              </Button>
            </div>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Summary */}
            <Card className="p-6 bg-card border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
                  <p className="text-3xl font-bold text-foreground">{sales.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Cash</p>
                  <p className="text-3xl font-bold text-accent">₹{totalCash.toFixed(2)}</p>
                </div>
              </div>

              {/* Next Report Time */}
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} />
                <span>Next report at 10 PM ({nextReportTime})</span>
              </div>
            </Card>

            {/* Sales List */}
            <Card className="p-6 bg-card border-border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-foreground">Today's Sales</h2>
                {sales.length > 0 && (
                  <Button
                    onClick={downloadReport}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Download size={16} />
                    Download
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sales.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No sales yet</p>
                ) : (
                  sales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex justify-between items-center p-3 bg-background rounded-lg border border-border hover:border-primary transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{sale.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{sale.amount} × {sale.quantity} = <span className="font-semibold">₹{sale.total.toFixed(2)}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => deleteSale(sale.id)}
                        className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
