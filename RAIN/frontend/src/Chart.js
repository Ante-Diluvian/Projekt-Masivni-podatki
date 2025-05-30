import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export function WorkoutChart({ workouts, name }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || workouts.length === 0 || !name) return;

    const filteredWorkouts = workouts.filter(w => w.name === name);
    if (filteredWorkouts.length === 0) return;

    const chartInstance = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: filteredWorkouts.map(w => new Date(w.startTimestamp).toLocaleString()),
        datasets: [{
          label: `Calories Burned - ${name}`,
          data: filteredWorkouts.map(w => w.caloriesBurned),
          borderColor: 'rgb(75, 192, 192)',
          fill: false
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: `Workout Calories Over Time: ${name}`
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Calories Burned'
            }
          }
        }
      }
    });

    return () => chartInstance.destroy();
  }, [workouts, name]);

  return (
    <div className="mt-4">
      <canvas ref={chartRef} />
    </div>
  );
}


export function LatestChart({ workouts }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || workouts.length === 0) return;

    const lastWorkout = workouts[workouts.length - 1];
    const chartInstance = new Chart(chartRef.current, {
      type: 'bar', 
      data: {
        labels: ['Duration (s)', 'Calories Burned', 'Distance (m)'],
        datasets: [{
            label: lastWorkout.name,
            data: [lastWorkout.duration, lastWorkout.caloriesBurned, lastWorkout.distance],
            backgroundColor: ['rgba(54, 162, 235, 0.6)','rgba(255, 99, 132, 0.6)','rgba(75, 192, 192, 0.6)'],
          }]
        },
      options: {
        plugins: {
          title: {
            display: true,
            text: `Last Workout: ${lastWorkout.name}`
          }
        },
      }
    });

    return () => chartInstance.destroy();
  }, [workouts]);

  return (
    <div className="mt-4">
      <canvas ref={chartRef} />
    </div>
  );
}

export function Exercise({ workouts }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || workouts.length === 0) return;

    const workoutCounts = workouts.reduce((acc, workout) => {
      acc[workout.name] = (acc[workout.name] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(workoutCounts);
    const data = Object.values(workoutCounts);

    const chartInstance = new Chart(chartRef.current, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
            data: data,
            backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)'],
          }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Most Common Exercises'
          }
        }
      }
    });

    return () => chartInstance.destroy();
  }, [workouts]);

  return (
    <div className="mt-4">
      <canvas ref={chartRef} />
    </div>
  );
}
