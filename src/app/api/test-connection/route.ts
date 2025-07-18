import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Test tenant connection
    const { data: tenantData, error: tenantError } = await supabaseServer
      .from('tenants')
      .select('*')
      .limit(1);

    if (tenantError) {
      console.error('Tenant query error:', tenantError);
      return NextResponse.json({ error: tenantError }, { status: 500 });
    }

    // Test classes connection
    const { data: classData, error: classError } = await supabaseServer
      .from('classes')
      .select('*')
      .limit(1);

    if (classError) {
      console.error('Class query error:', classError);
      return NextResponse.json({ error: classError }, { status: 500 });
    }

    // Test students connection
    const { data: studentData, error: studentError } = await supabaseServer
      .from('students')
      .select('*')
      .limit(1);

    if (studentError) {
      console.error('Student query error:', studentError);
      return NextResponse.json({ error: studentError }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        tenants: tenantData,
        classes: classData,
        students: studentData,
      },
    });
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
