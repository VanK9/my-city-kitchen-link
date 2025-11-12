import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart } from 'lucide-react';

interface ContractBreakdown {
  contractName: string;
  salary: number;
}

export const SalaryBreakdownWidget = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ContractBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalSalary, setTotalSalary] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchBreakdown = async () => {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const { data: summaries, error } = await supabase
        .from('monthly_summaries')
        .select(`
          contract_id,
          total_salary,
          work_contracts!inner(
            employer_id,
            employers!inner(employer_name)
          )
        `)
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (error) {
        console.error('Error fetching salary breakdown:', error);
        setIsLoading(false);
        return;
      }

      const breakdown = summaries?.map(s => ({
        contractName: (s.work_contracts as any)?.employers?.employer_name || 'Άγνωστος Εργοδότης',
        salary: Number(s.total_salary || 0)
      })) || [];

      const total = breakdown.reduce((sum, item) => sum + item.salary, 0);

      setData(breakdown);
      setTotalSalary(total);
      setIsLoading(false);
    };

    fetchBreakdown();
  }, [user]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Ανάλυση Μισθού
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Φόρτωση...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Ανάλυση Μισθού
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Δεν υπάρχουν δεδομένα για τον τρέχοντα μήνα
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Ανάλυση Μισθού ανά Σύμβαση
        </CardTitle>
        <CardDescription>
          Τρέχων μήνας - Σύνολο: €{totalSalary.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="contractName" 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number) => [`€${value.toFixed(2)}`, 'Μισθός']}
            />
            <Legend />
            <Bar 
              dataKey="salary" 
              fill="hsl(var(--primary))" 
              radius={[8, 8, 0, 0]}
              name="Μισθός"
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">{item.contractName}</span>
              <span className="text-sm font-bold">€{item.salary.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
